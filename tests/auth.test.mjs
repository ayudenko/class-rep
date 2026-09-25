import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../server/core/app.mjs';
const origin='http://localhost:5173';
const adult=(email,role='teacher')=>({email,password:'Long-Test-Pass-123',name:'Ирина',role});
test('adult registration, session, logout and persistent account', async()=>{
 const {app,close}=createApp({dbPath:':memory:'}); const client=request.agent(app);
 const result=await client.post('/api/auth/register').set('Origin',origin).send(adult('teacher@example.test'));
 assert.equal(result.status,201); assert.equal(result.body.user.role,'teacher');
 assert.equal((await client.get('/api/auth/me')).status,200);
 assert.equal((await client.post('/api/auth/logout').set('Origin',origin)).status,204);
 assert.equal((await client.get('/api/auth/me')).status,401);close();
});
test('teacher creates class/student, isolated profiles and one-use parent invite',async()=>{
 const {app,close}=createApp({dbPath:':memory:'});const teacher=request.agent(app),other=request.agent(app),parent=request.agent(app),pupil=request.agent(app);
 for(const [client,email,role] of [[teacher,'one@example.test','teacher'],[other,'two@example.test','teacher'],[parent,'parent@example.test','parent']])assert.equal((await client.post('/api/auth/register').set('Origin',origin).send(adult(email,role))).status,201);
 const c=await teacher.post('/api/classes').set('Origin',origin).send({name:'5 А',schoolYear:'2026–2027'});assert.equal(c.status,201);
 const s=await teacher.post(`/api/classes/${c.body.id}/students`).set('Origin',origin).send({fullName:'Анна Петрова',login:'anna.student',password:'Long-Test-Pass-123',privateNote:'Только учителю'});assert.equal(s.status,201);assert.equal(s.body.password,undefined);
 assert.equal((await other.get(`/api/classes/${c.body.id}/students`)).status,403);assert.equal((await parent.get(`/api/classes/${c.body.id}/students`)).status,403);
 assert.equal((await pupil.post('/api/auth/login').set('Origin',origin).send({login:'anna.student',password:'Long-Test-Pass-123'})).status,200);
 const profile=await pupil.get(`/api/classes/${c.body.id}/students`);assert.equal(profile.body.length,1);assert.equal(profile.body[0].privateNote,undefined);
 const invite=await teacher.post(`/api/students/${s.body.id}/invites`).set('Origin',origin).send({});assert.equal(invite.status,201);
 assert.equal((await parent.post('/api/invites/accept').set('Origin',origin).send({token:invite.body.token})).status,200);
 assert.equal((await parent.post('/api/invites/accept').set('Origin',origin).send({token:invite.body.token})).status,410);
 assert.equal((await parent.get(`/api/classes/${c.body.id}/students`)).body[0].privateNote,undefined);
 assert.equal((await parent.get('/api/classes')).body.length,1);close();
});
test('password change revokes all sessions and wrong origins fail closed',async()=>{
 const {app,close}=createApp({dbPath:':memory:'});const a=request.agent(app),b=request.agent(app);
 await a.post('/api/auth/register').set('Origin',origin).send(adult('change@example.test'));await b.post('/api/auth/login').set('Origin',origin).send({login:'change@example.test',password:'Long-Test-Pass-123'});
 assert.equal((await a.post('/api/auth/password').set('Origin','https://evil.example').send({currentPassword:'Long-Test-Pass-123',newPassword:'New-Test-Pass-123'})).status,403);
 assert.equal((await a.post('/api/auth/password').set('Origin',origin).send({currentPassword:'Long-Test-Pass-123',newPassword:'New-Test-Pass-123'})).status,204);
 assert.equal((await b.get('/api/auth/me')).status,401);assert.equal((await a.get('/api/auth/me')).status,401);
 assert.equal((await a.post('/api/auth/login').set('Origin',origin).send({login:'change@example.test',password:'New-Test-Pass-123'})).status,200);close();
});
test('operator reset is one-use, revokes sessions and persists after reopen',async()=>{
 const {mkdtempSync,rmSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {spawnSync}=await import('node:child_process');
 const dir=mkdtempSync(join(tmpdir(),'klassno-')),dbPath=join(dir,'test.sqlite');let instance=createApp({dbPath});const client=request.agent(instance.app);
 await client.post('/api/auth/register').set('Origin',origin).send(adult('reset@example.test'));
 const command=spawnSync(process.execPath,['server/reset-password.mjs','reset@example.test'],{env:{...process.env,DB_PATH:dbPath},encoding:'utf8'});assert.equal(command.status,0);
 const resetToken=new URL(command.stdout.trim()).hash.split('=')[1];assert.ok(resetToken);
 assert.equal((await client.post('/api/auth/reset').set('Origin',origin).send({token:resetToken,password:'Reset-New-Pass-123'})).status,204);
 assert.equal((await client.get('/api/auth/me')).status,401);
 assert.equal((await client.post('/api/auth/reset').set('Origin',origin).send({token:resetToken,password:'Reset-New-Pass-123'})).status,410);
 instance.close();instance=createApp({dbPath});assert.equal((await request(instance.app).post('/api/auth/login').set('Origin',origin).send({login:'reset@example.test',password:'Reset-New-Pass-123'})).status,200);instance.close();rmSync(dir,{recursive:true});
});
test('two independent classes and families cannot read or edit each other',async()=>{
 const {app,close}=createApp({dbPath:':memory:'});const families=[];
 for(let i=0;i<2;i++){const teacher=request.agent(app),parent=request.agent(app),student=request.agent(app);await teacher.post('/api/auth/register').set('Origin',origin).send(adult(`teacher${i}@example.test`));await parent.post('/api/auth/register').set('Origin',origin).send(adult(`family${i}@example.test`,'parent'));const c=(await teacher.post('/api/classes').set('Origin',origin).send({name:`Класс ${i}`,schoolYear:'2026–2027'})).body;const s=(await teacher.post(`/api/classes/${c.id}/students`).set('Origin',origin).send({fullName:`Ученик ${i}`,login:`pupil${i}`,password:'Long-Test-Pass-123',privateNote:`Приватная заметка ${i}`})).body;const invitation=(await teacher.post(`/api/students/${s.id}/invites`).set('Origin',origin).send({})).body;await parent.post('/api/invites/accept').set('Origin',origin).send({token:invitation.token});await student.post('/api/auth/login').set('Origin',origin).send({login:`pupil${i}`,password:'Long-Test-Pass-123'});families.push({teacher,parent,student,c,s});}
 for(let i=0;i<2;i++){const own=families[i],other=families[1-i];for(const client of [own.teacher,own.parent,own.student]){assert.equal((await client.get(`/api/classes/${other.c.id}/students`)).status,403);assert.equal((await client.put(`/api/classes/${other.c.id}/students/${other.s.id}`).set('Origin',origin).send({fullName:'Подмена'})).status,403);assert.equal((await client.post(`/api/students/${other.s.id}/invites`).set('Origin',origin).send({})).status,403);assert.deepEqual((await client.get('/api/classes')).body.map(c=>c.id),[own.c.id]);}for(const client of [own.parent,own.student]){const list=(await client.get(`/api/classes/${own.c.id}/students`)).body;assert.deepEqual(list.map(s=>s.id),[own.s.id]);assert.ok(!JSON.stringify(list).includes('Приватная'));assert.ok(!JSON.stringify(list).includes('password'));}}
 close();
});
test('native bearer is memory-session transport; production defaults deny writes',async()=>{
 const {app,close}=createApp({dbPath:':memory:'});const r=await request(app).post('/api/auth/register').set('Origin','capacitor://localhost').set('X-Client','mobile').send(adult('native@example.test'));assert.equal(r.status,201);assert.ok(r.body.token);assert.equal(r.headers['set-cookie'],undefined);assert.equal((await request(app).get('/api/auth/me').set('Authorization',`Bearer ${r.body.token}`)).status,200);
 const web=await request(app).post('/api/auth/login').set('Origin',origin).set('X-Client','mobile').send({login:'native@example.test',password:'Long-Test-Pass-123'});assert.equal(web.status,200);assert.equal(web.body.token,undefined);assert.ok(web.headers['set-cookie']);close();
 const prod=createApp({dbPath:':memory:',production:true,origins:[]});assert.equal((await request(prod.app).post('/api/auth/register').set('Origin',origin).send(adult('denied@example.test'))).status,403);assert.equal((await request(prod.app).post('/api/auth/register').send(adult('missing@example.test'))).status,403);prod.close();
});
test('login failures use one generic response even for short or empty passwords',async()=>{
 const {app,close}=createApp({dbPath:':memory:'});
 for(const password of ['','short','A-valid-length-password']){const response=await request(app).post('/api/auth/login').set('Origin',origin).send({login:'unknown@example.test',password});assert.equal(response.status,401);assert.equal(response.body.error,'Неверный логин или пароль');}close();
});

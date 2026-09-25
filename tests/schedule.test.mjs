import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../server/core/app.mjs';
const origin='http://localhost:5173';
const mutate=(client,method,url,body={})=>client[method](url).set('Origin',origin).send(body);
async function setup(t){const instance=createApp({dbPath:':memory:'});t.after(instance.close);const teacher=request.agent(instance.app);assert.equal((await mutate(teacher,'post','/api/auth/register',{email:'teacher@example.test',name:'Учитель',role:'teacher',password:'Long-Test-Pass-123'})).status,201);const c=(await mutate(teacher,'post','/api/classes',{name:'5 А',schoolYear:'2026–2027'})).body;return {...instance,teacher,c,base:`/api/classes/${c.id}`};}
const lesson={dayOfWeek:1,lessonNumber:1,subject:'Математика',room:'204'};
test('lessons append automatically, compact after delete/move, validate fields and cap each day',async t=>{
 const {teacher,base}=await setup(t),path=`${base}/lessons`;
 const first=await mutate(teacher,'post',path,{dayOfWeek:1,subject:'Математика',room:'204'});assert.equal(first.status,201);assert.equal(first.body.lessonNumber,1);
 const second=await mutate(teacher,'post',path,{...lesson,lessonNumber:20,subject:'История'});assert.equal(second.status,201);assert.equal(second.body.lessonNumber,2);
 const third=await mutate(teacher,'post',path,{...lesson,lessonNumber:1,subject:'Музыка'});assert.equal(third.body.lessonNumber,3);
 const url=`${path}/${second.body.id}`;
 for(const body of [{...lesson,dayOfWeek:0},{...lesson,dayOfWeek:8},{...lesson,lessonNumber:'2'},{...lesson,lessonNumber:21},{...lesson,subject:''}])assert.equal((await mutate(teacher,'put',url,body)).status,400);
 assert.equal((await mutate(teacher,'put',url,{...lesson,lessonNumber:1,subject:'Новая история'})).body.lessonNumber,2);
 assert.equal((await mutate(teacher,'delete',`${path}/${first.body.id}`)).status,204);
 assert.deepEqual((await teacher.get(path)).body.map(l=>[l.subject,l.lessonNumber]),[['Новая история',1],['Музыка',2]]);
 const moved=await mutate(teacher,'put',url,{dayOfWeek:2,subject:'История'});assert.equal(moved.status,200);assert.equal(moved.body.lessonNumber,1);
 assert.deepEqual((await teacher.get(path)).body.map(l=>[l.subject,l.dayOfWeek,l.lessonNumber]),[['Музыка',1,1],['История',2,1]]);
 for(let i=2;i<=20;i++)assert.equal((await mutate(teacher,'post',path,{dayOfWeek:2,subject:`Урок ${i}`})).body.lessonNumber,i);
 assert.equal((await mutate(teacher,'post',path,{dayOfWeek:2,subject:'Лишний'})).status,409);
 assert.equal((await mutate(teacher,'put',`${path}/${third.body.id}`,{dayOfWeek:2,subject:'Музыка'})).status,409);
 assert.deepEqual((await teacher.get(path)).body.filter(l=>l.dayOfWeek===1).map(l=>[l.id,l.lessonNumber]),[[third.body.id,1]]);
 assert.equal((await mutate(teacher,'delete',`${path}/${first.body.id}`)).status,404);
});
test('bells: CRUD, strict clock values, overlap rejection and adjacent intervals',async t=>{
 const {teacher,base}=await setup(t);const path=`${base}/bells`,bell={lessonNumber:1,startTime:'08:00',endTime:'08:45'};
 assert.deepEqual((await teacher.get(path)).body,[]);const r=await mutate(teacher,'post',path,bell);assert.equal(r.status,201);const url=`${path}/${r.body.id}`;
 for(const body of [{...bell,startTime:'8:00'},{...bell,endTime:'24:00'},{...bell,endTime:'08:00'},{...bell,endTime:'07:59'},{...bell,lessonNumber:0}])assert.equal((await mutate(teacher,'put',url,body)).status,400);
 for(const body of [{...bell,lessonNumber:2,startTime:'08:30',endTime:'09:00'},{...bell,lessonNumber:2,startTime:'07:30',endTime:'08:10'},{...bell,lessonNumber:2,startTime:'07:00',endTime:'10:00'},bell])assert.equal((await mutate(teacher,'post',path,body)).status,409);
 const adjacent=await mutate(teacher,'post',path,{lessonNumber:2,startTime:'08:45',endTime:'09:30'});assert.equal(adjacent.status,201);
 assert.equal((await mutate(teacher,'put',url,{...bell,endTime:'08:46'})).status,409);
 assert.equal((await mutate(teacher,'put',url,{...bell,startTime:'07:55'})).body.startTime,'07:55');
 assert.equal((await mutate(teacher,'delete',url)).status,204);assert.equal((await teacher.get(path)).body.length,1);assert.equal((await mutate(teacher,'put',url,bell)).status,404);
});
test('schedule access: two families isolated by class and item IDs; parent/student read only',async t=>{
 const {app,teacher,base}=await setup(t),other=request.agent(app),parent=request.agent(app),student=request.agent(app),otherParent=request.agent(app),otherStudent=request.agent(app);
 for(const [client,email,role] of [[other,'other@example.test','teacher'],[parent,'parent@example.test','parent'],[otherParent,'other-parent@example.test','parent']])assert.equal((await mutate(client,'post','/api/auth/register',{email,role,name:'Участник',password:'Long-Test-Pass-123'})).status,201);
 const foreign=(await mutate(other,'post','/api/classes',{name:'Другой класс',schoolYear:'2026'})).body;
 const child=(await mutate(teacher,'post',`${base}/students`,{fullName:'Анна',login:'anna.schedule',password:'Long-Test-Pass-123'})).body;
 const invite=(await mutate(teacher,'post',`/api/students/${child.id}/invites`)).body;assert.equal((await mutate(parent,'post','/api/invites/accept',{token:invite.token})).status,200);
 assert.equal((await mutate(student,'post','/api/auth/login',{login:'anna.schedule',password:'Long-Test-Pass-123'})).status,200);
 const otherChild=(await mutate(other,'post',`/api/classes/${foreign.id}/students`,{fullName:'Борис',login:'boris.schedule',password:'Long-Test-Pass-123'})).body;
 const otherInvite=(await mutate(other,'post',`/api/students/${otherChild.id}/invites`)).body;assert.equal((await mutate(otherParent,'post','/api/invites/accept',{token:otherInvite.token})).status,200);assert.equal((await mutate(otherStudent,'post','/api/auth/login',{login:'boris.schedule',password:'Long-Test-Pass-123'})).status,200);
 for(const [resource,payload] of [['lessons',lesson],['bells',{lessonNumber:1,startTime:'08:00',endTime:'08:45'}]]){
  const path=`${base}/${resource}`,foreignPath=`/api/classes/${foreign.id}/${resource}`;
  const own=(await mutate(teacher,'post',path,payload)).body,alien=(await mutate(other,'post',foreignPath,payload)).body;
  assert.equal((await request(app).get(path)).status,401);
  if(resource==='lessons'){const order={dayOfWeek:1,lessonIds:[own.id]};assert.equal((await mutate(request(app),'put',`${path}/order`,order)).status,401);for(const client of [other,parent,student,otherParent,otherStudent])assert.equal((await mutate(client,'put',`${path}/order`,order)).status,403);assert.equal((await mutate(teacher,'put',`${foreignPath}/order`,{dayOfWeek:1,lessonIds:[alien.id]})).status,403);}
  for(const client of [teacher,parent,student])assert.equal((await client.get(foreignPath)).status,403);
  for(const client of [other,otherParent,otherStudent])assert.equal((await client.get(path)).status,403);
  for(const client of [otherParent,otherStudent]){assert.equal((await client.get(foreignPath)).body[0].id,alien.id);for(const method of ['post','put','delete'])assert.equal((await mutate(client,method,method==='post'?foreignPath:`${foreignPath}/${alien.id}`,payload)).status,403);}
  for(const client of [parent,student]){assert.equal((await client.get(path)).body[0].id,own.id);for(const method of ['post','put','delete'])assert.equal((await mutate(client,method,method==='post'?path:`${path}/${own.id}`,payload)).status,403);}
  for(const method of ['put','delete']){assert.equal((await mutate(teacher,method,`${path}/${alien.id}`,payload)).status,404);assert.equal((await mutate(teacher,method,`${foreignPath}/${alien.id}`,payload)).status,403);assert.equal((await mutate(other,method,`${foreignPath}/${own.id}`,payload)).status,404);}
  assert.deepEqual((await other.get(foreignPath)).body.map(item=>item.id),[alien.id]);
 }
});
test('reorder is atomic at full capacity, rejects stale/foreign sets, preserves legacy gaps until mutation and persists',async t=>{
 const {mkdtempSync,rmSync}=await import('node:fs'),{tmpdir}=await import('node:os'),{join}=await import('node:path');
 const dir=mkdtempSync(join(tmpdir(),'klassno-order-')),dbPath=join(dir,'test.sqlite');let instance=createApp({dbPath});t.after(()=>{instance.close();rmSync(dir,{recursive:true});});
 let teacher=request.agent(instance.app);assert.equal((await mutate(teacher,'post','/api/auth/register',{email:'order@example.test',name:'Учитель',role:'teacher',password:'Long-Test-Pass-123'})).status,201);
 const classroom=(await mutate(teacher,'post','/api/classes',{name:'Порядок',schoolYear:'2026'})).body,path=`/api/classes/${classroom.id}/lessons`,ids=[];
 for(let n=1;n<=20;n++){const result=await mutate(teacher,'post',path,{dayOfWeek:1,subject:`Урок ${n}`,room:`Кабинет ${n}`});assert.equal(result.status,201);ids.push(result.body.id);}
 const reorder=lessonIds=>mutate(teacher,'put',`${path}/order`,{dayOfWeek:1,lessonIds});
 const reversed=[...ids].reverse(),result=await reorder(reversed);assert.equal(result.status,200);assert.deepEqual(result.body.map(l=>l.id),reversed);assert.deepEqual(result.body.map(l=>l.lessonNumber),Array.from({length:20},(_,i)=>i+1));assert.equal(result.body[0].room,'Кабинет 20');
 assert.equal((await reorder(reversed)).status,200);
 for(const body of [{dayOfWeek:0,lessonIds:ids},{dayOfWeek:1,lessonIds:'oops'},{dayOfWeek:1,lessonIds:[...ids,ids[0]]},{dayOfWeek:1,lessonIds:[ids[0],ids[0]]},{dayOfWeek:1,lessonIds:[null]},{lessonIds:ids},[]])assert.equal((await mutate(teacher,'put',`${path}/order`,body)).status,400);
 assert.equal((await reorder(ids.slice(1))).status,409);assert.equal((await reorder([...ids.slice(1),'foreign-id'])).status,409);
 const foreignClass=(await mutate(teacher,'post','/api/classes',{name:'Второй класс',schoolYear:'2026'})).body,foreign=(await mutate(teacher,'post',`/api/classes/${foreignClass.id}/lessons`,{dayOfWeek:1,subject:'Чужой урок'})).body;
 assert.equal((await reorder([...ids.slice(1),foreign.id])).status,409);
 // Simulate an SQLite insertion failure after earlier rows have already been replaced.
 instance.db.exec("CREATE TEMP TRIGGER fail_order BEFORE INSERT ON lessons WHEN NEW.subject='Урок 10' BEGIN SELECT RAISE(ABORT,'forced storage failure'); END;");
 assert.equal((await reorder(ids)).status,400);assert.deepEqual((await teacher.get(path)).body.map(l=>l.id),reversed);instance.db.exec('DROP TRIGGER fail_order');
 // Legacy database fixture: no startup/read renumbering; only the edited day is normalized.
 instance.db.prepare('INSERT INTO lessons VALUES(?,?,?,?,?,?)').run('legacy-a',classroom.id,2,5,'Первый старый','1');instance.db.prepare('INSERT INTO lessons VALUES(?,?,?,?,?,?)').run('legacy-b',classroom.id,2,9,'Второй старый','2');
 assert.deepEqual((await teacher.get(path)).body.filter(l=>l.dayOfWeek===2).map(l=>l.lessonNumber),[5,9]);
 assert.equal((await mutate(teacher,'put',`${path}/order`,{dayOfWeek:2,lessonIds:['legacy-b','legacy-a']})).status,200);
 assert.deepEqual((await teacher.get(path)).body.filter(l=>l.dayOfWeek===2).map(l=>[l.id,l.lessonNumber]),[['legacy-b',1],['legacy-a',2]]);
 const stale=await mutate(teacher,'put',`${path}/order`,{dayOfWeek:2,lessonIds:['legacy-a']});assert.equal(stale.status,409);
 instance.close();instance=createApp({dbPath});teacher=request.agent(instance.app);assert.equal((await mutate(teacher,'post','/api/auth/login',{login:'order@example.test',password:'Long-Test-Pass-123'})).status,200);
 const persisted=(await teacher.get(path)).body;assert.deepEqual(persisted.filter(l=>l.dayOfWeek===1).map(l=>l.id),reversed);assert.deepEqual(persisted.filter(l=>l.dayOfWeek===2).map(l=>l.id),['legacy-b','legacy-a']);
});

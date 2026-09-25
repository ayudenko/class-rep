import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../server/core/app.mjs';
const origin='http://localhost:5173';
const mutate=(client,method,url,body={})=>client[method](url).set('Origin',origin).send(body);
async function setup(t){const instance=createApp({dbPath:':memory:'});t.after(instance.close);const teacher=request.agent(instance.app);assert.equal((await mutate(teacher,'post','/api/auth/register',{email:'teacher@example.test',name:'Учитель',role:'teacher',password:'Long-Test-Pass-123'})).status,201);const c=(await mutate(teacher,'post','/api/classes',{name:'5 А',schoolYear:'2026–2027'})).body;return {...instance,teacher,c,base:`/api/classes/${c.id}`};}
const lesson={dayOfWeek:1,lessonNumber:1,subject:'Математика',room:'204'};
test('lessons: full CRUD, unique class/day slot, input validation and stable rejected update',async t=>{
 const {teacher,base}=await setup(t);assert.deepEqual((await teacher.get(`${base}/lessons`)).body,[]);
 const created=await mutate(teacher,'post',`${base}/lessons`,lesson);assert.equal(created.status,201);assert.equal(created.body.subject,'Математика');const url=`${base}/lessons/${created.body.id}`;
 assert.equal((await mutate(teacher,'post',`${base}/lessons`,lesson)).status,409);
 for(const body of [{...lesson,dayOfWeek:0},{...lesson,dayOfWeek:8},{...lesson,lessonNumber:'2'},{...lesson,lessonNumber:21},{...lesson,subject:''}])assert.equal((await mutate(teacher,'put',url,body)).status,400);
 assert.equal((await teacher.get(`${base}/lessons`)).body[0].subject,'Математика');
 const second=await mutate(teacher,'post',`${base}/lessons`,{...lesson,lessonNumber:2});assert.equal(second.status,201);
 assert.equal((await mutate(teacher,'put',url,{...lesson,lessonNumber:2})).status,409);
 const edited=await mutate(teacher,'put',url,{...lesson,dayOfWeek:2,subject:'История'});assert.equal(edited.status,200);assert.equal(edited.body.dayOfWeek,2);
 assert.equal((await mutate(teacher,'delete',url)).status,204);assert.equal((await mutate(teacher,'delete',url)).status,404);assert.equal((await teacher.get(`${base}/lessons`)).body.length,1);
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
  for(const client of [teacher,parent,student])assert.equal((await client.get(foreignPath)).status,403);
  for(const client of [other,otherParent,otherStudent])assert.equal((await client.get(path)).status,403);
  for(const client of [otherParent,otherStudent]){assert.equal((await client.get(foreignPath)).body[0].id,alien.id);for(const method of ['post','put','delete'])assert.equal((await mutate(client,method,method==='post'?foreignPath:`${foreignPath}/${alien.id}`,payload)).status,403);}
  for(const client of [parent,student]){assert.equal((await client.get(path)).body[0].id,own.id);for(const method of ['post','put','delete'])assert.equal((await mutate(client,method,method==='post'?path:`${path}/${own.id}`,payload)).status,403);}
  for(const method of ['put','delete']){assert.equal((await mutate(teacher,method,`${path}/${alien.id}`,payload)).status,404);assert.equal((await mutate(teacher,method,`${foreignPath}/${alien.id}`,payload)).status,403);assert.equal((await mutate(other,method,`${foreignPath}/${own.id}`,payload)).status,404);}
  assert.deepEqual((await other.get(foreignPath)).body.map(item=>item.id),[alien.id]);
 }
});

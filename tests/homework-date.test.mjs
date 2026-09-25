import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {nextLessonDueDate} from '../src/features/homework/scheduleDate.mjs';
test('new homework defaults to the nearest matching lesson strictly after the local day',()=>{
 const friday=new Date(2026,8,25,15,30);
 assert.equal(nextLessonDueDate('Математика',[{subject:'Математика',dayOfWeek:1}],friday),'2026-09-28');
 assert.equal(nextLessonDueDate('Математика',[{subject:'Математика',dayOfWeek:5}],friday),'2026-10-02');
 assert.equal(nextLessonDueDate('  МАТЕМАТИКА  ',[{subject:' математика ',dayOfWeek:1},{subject:'Математика',dayOfWeek:6},{subject:'Математика',dayOfWeek:5}],friday),'2026-09-26');
 assert.equal(nextLessonDueDate('Русский   язык',[{subject:'русский язык',dayOfWeek:7}],friday),'2026-09-27');
 assert.equal(nextLessonDueDate('Русский язык',[{subject:'Русская литература',dayOfWeek:6}],friday),'');
 assert.equal(nextLessonDueDate(' ',[{subject:'Математика',dayOfWeek:6}],friday),'');
 assert.equal(nextLessonDueDate('Математика',[],friday),'');
 assert.equal(nextLessonDueDate('Математика',[{subject:'Математика',dayOfWeek:1}],new Date(2026,11,31)),'2027-01-04');
 assert.equal(nextLessonDueDate('Математика',[{subject:'Математика',dayOfWeek:2}],new Date(2028,1,28)),'2028-02-29');
 const helperUrl=new URL('../src/features/homework/scheduleDate.mjs',import.meta.url).href;
 for(const zone of ['Pacific/Kiritimati','Pacific/Honolulu','America/New_York','Europe/Minsk']){
  const script=`import {nextLessonDueDate} from ${JSON.stringify(helperUrl)}; console.log(JSON.stringify([nextLessonDueDate('Math',[{subject:'Math',dayOfWeek:1}],new Date(2026,8,25,23,45)),nextLessonDueDate('Math',[{subject:'Math',dayOfWeek:1}],new Date(2026,10,1,0,30))]));`;
  const child=spawnSync(process.execPath,['--input-type=module','--eval',script],{encoding:'utf8',env:{...process.env,TZ:zone}});
  assert.equal(child.status,0,child.stderr);assert.deepEqual(JSON.parse(child.stdout),['2026-09-28','2026-11-02'],zone);
 }

});

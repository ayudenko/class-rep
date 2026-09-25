import {useEffect,useId,useState,type FormEvent} from 'react';
import {api} from '../../core/api';
import {Button,Dialog,ErrorMessage,Input} from '../../core/ui';
import type {Homework} from './types';
import {nextLessonDueDate,normalizeSubject,type ScheduledLesson} from './scheduleDate.mjs';

type Props={classId:string;homework:Homework|null;busy:boolean;error:string;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;onClose:()=>void};
export default function HomeworkEditor({classId,homework,busy,error,onSubmit,onClose}:Props){
 const [subject,setSubject]=useState(homework?.subject??'');
 // null means automatic. Even an intentionally cleared date is a manual choice.
 // Existing assignments start manual, so schedule loading can never change them.
 const [manualDate,setManualDate]=useState<string|null>(homework?.dueDate??null);
 const [lessons,setLessons]=useState<ScheduledLesson[]>([]),[scheduleState,setScheduleState]=useState<'loading'|'ready'|'failed'>('loading');
 const subjectListId=useId(),dateHintId=useId();
 useEffect(()=>{let active=true;const controller=new AbortController();setScheduleState('loading');setLessons([]);api<ScheduledLesson[]>(`/api/classes/${classId}/lessons`,{signal:controller.signal}).then(data=>{if(active){setLessons(data);setScheduleState('ready');}}).catch(()=>{if(active)setScheduleState('failed');});return()=>{active=false;controller.abort();};},[classId]);
 const automaticDate=nextLessonDueDate(subject,lessons),dueDate=manualDate??automaticDate;
 const subjects=[...new Map(lessons.map(lesson=>[normalizeSubject(lesson.subject),lesson.subject.trim().replace(/\s+/g,' ')])).values()];
 const hint=scheduleState==='failed'?'Не удалось загрузить расписание. Дату можно указать вручную.':manualDate!==null?(homework?'Сохранённый срок можно изменить вручную.':'Дата выбрана вручную и не изменится при смене предмета.'):scheduleState==='loading'?'Ищем ближайший урок в расписании…':automaticDate?'Срок — к ближайшему уроку после сегодняшнего дня. Дату можно изменить.':subject.trim()?'Такого предмета нет в расписании. Укажите дату вручную.':'Выберите предмет — подставим дату следующего урока.';
 return <Dialog title={homework?'Редактировать задание':'Новое задание'} onClose={()=>{if(!busy)onClose();}}><form onSubmit={onSubmit}>
  <Input label="Предмет" name="subject" required maxLength={100} list={subjectListId} value={subject} onChange={e=>setSubject(e.target.value)} disabled={busy}/>
  <datalist id={subjectListId}>{subjects.map(value=><option key={normalizeSubject(value)} value={value}/>)}</datalist>
  <Input label="Заголовок" name="title" required maxLength={200} defaultValue={homework?.title??''} disabled={busy}/>
  <label className="field"><span>Что нужно сделать</span><textarea name="description" rows={5} maxLength={5000} defaultValue={homework?.description??''} disabled={busy}/></label>
  <Input label="Срок выполнения" name="dueDate" type="date" required value={dueDate} onChange={e=>setManualDate(e.target.value)} aria-describedby={dateHintId} disabled={busy}/>
  <p className="hw-date-hint" id={dateHintId} role="status">{hint}</p>
  <ErrorMessage message={error}/><div className="form-actions"><Button type="button" variant="ghost" disabled={busy} onClick={onClose}>Отмена</Button><Button disabled={busy}>{busy?'Сохраняем…':'Сохранить задание'}</Button></div>
 </form></Dialog>;
}

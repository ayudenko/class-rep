import {useState} from 'react';
import {DndContext,DragOverlay,MouseSensor,TouchSensor,KeyboardSensor,closestCenter,useSensor,useSensors,type DragEndEvent} from '@dnd-kit/core';
import {SortableContext,useSortable,verticalListSortingStrategy,sortableKeyboardCoordinates,arrayMove} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {ArrowUp,ArrowDown,Clock3,DoorOpen,GripVertical,Pencil,Trash2} from 'lucide-react';
import type {Lesson,Bell} from './SchedulePage';
type Props={lessons:Lesson[];bells:Bell[];teacher:boolean;disabled:boolean;onOrder:(ids:string[])=>void;onEdit:(lesson:Lesson)=>void;onDelete:(lesson:Lesson)=>void;onDragging:(active:boolean)=>void};
export default function SortableLessonList(props:Props){
 const {lessons,bells,teacher,disabled,onOrder,onDragging}=props;
 const [activeId,setActiveId]=useState<string|null>(null);
 const sensors=useSensors(useSensor(MouseSensor,{activationConstraint:{distance:6}}),useSensor(TouchSensor,{activationConstraint:{delay:180,tolerance:5}}),useSensor(KeyboardSensor,{coordinateGetter:sortableKeyboardCoordinates}));
 const title=(id:string|number)=>lessons.find(l=>l.id===id)?.subject??'Урок';
 const end=({active,over}:DragEndEvent)=>{setActiveId(null);onDragging(false);if(disabled||!over||active.id===over.id)return;const from=lessons.findIndex(l=>l.id===active.id),to=lessons.findIndex(l=>l.id===over.id);if(from!==-1&&to!==-1)onOrder(arrayMove(lessons,from,to).map(l=>l.id));};
 const active=lessons.find(l=>l.id===activeId);
 return <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={({active})=>{setActiveId(String(active.id));onDragging(true);}} onDragCancel={()=>{setActiveId(null);onDragging(false);}} onDragEnd={end} accessibility={{screenReaderInstructions:{draggable:'Чтобы переместить урок, нажмите пробел, затем стрелки вверх или вниз. Для сохранения нажмите пробел, для отмены — Escape.'},announcements:{onDragStart:({active})=>`Перемещаем ${title(active.id)}.`,onDragOver:({active,over})=>over?`${title(active.id)}: позиция ${lessons.findIndex(l=>l.id===over.id)+1} из ${lessons.length}.`:undefined,onDragEnd:({active,over})=>over?`${title(active.id)} перемещён. Порядок сохраняется.`:'Перемещение отменено.',onDragCancel:()=> 'Перемещение отменено.'}}}>
  <SortableContext items={lessons.map(l=>l.id)} strategy={verticalListSortingStrategy}><div className="schedule-lessons" aria-label="Порядок уроков">{lessons.map((lesson,index)=><SortableLesson key={lesson.id} lesson={lesson} bell={bells.find(b=>b.lessonNumber===lesson.lessonNumber)} index={index} count={lessons.length} teacher={teacher} disabled={disabled} controlsDisabled={disabled||activeId!==null} onEdit={()=>props.onEdit(lesson)} onDelete={()=>props.onDelete(lesson)} onMove={delta=>onOrder(arrayMove(lessons,index,index+delta).map(l=>l.id))}/>)}</div></SortableContext>
  <DragOverlay dropAnimation={null}>{active?<article className="schedule-lesson schedule-drag-overlay" aria-hidden="true"><GripVertical size={20}/><LessonContent lesson={active} bell={bells.find(b=>b.lessonNumber===active.lessonNumber)} index={lessons.indexOf(active)}/></article>:null}</DragOverlay>
 </DndContext>;
}
function LessonContent({lesson,bell,index}:{lesson:Lesson;bell?:Bell;index:number}){return <><div className={`schedule-number schedule-tone-${index%3}`}>{lesson.lessonNumber}<small>урок</small></div><div className="schedule-lesson-body"><h3>{lesson.subject}</h3><div className="schedule-meta"><span><Clock3 size={14}/>{bell?`${bell.startTime} — ${bell.endTime}`:'Время не задано'}</span>{lesson.room&&<span><DoorOpen size={14}/>{lesson.room}</span>}</div></div></>;}
function SortableLesson({lesson,bell,index,count,teacher,disabled,controlsDisabled,onEdit,onDelete,onMove}:{lesson:Lesson;bell?:Bell;index:number;count:number;teacher:boolean;disabled:boolean;controlsDisabled:boolean;onEdit:()=>void;onDelete:()=>void;onMove:(delta:number)=>void}){
 const {attributes,listeners,setNodeRef,setActivatorNodeRef,transform,transition,isDragging}=useSortable({id:lesson.id,disabled:!teacher||disabled});
 return <article ref={setNodeRef} style={{transform:CSS.Transform.toString(transform),transition,opacity:isDragging?.3:1}} className={`schedule-lesson ${teacher?'schedule-lesson-editable':''}`}>
  {teacher&&<button className="icon-button schedule-drag-handle" ref={setActivatorNodeRef} {...attributes} {...listeners} disabled={disabled||count<2} aria-label={`Переместить ${lesson.subject}`} title="Перетащить урок"><GripVertical size={20}/></button>}
  <LessonContent lesson={lesson} bell={bell} index={index}/>
  {teacher&&<div className="schedule-lesson-tools"><div className="schedule-move-actions"><button className="icon-button" disabled={controlsDisabled||index===0} aria-label={`Поднять ${lesson.subject}`} title="На урок выше" onClick={()=>onMove(-1)}><ArrowUp size={15}/></button><button className="icon-button" disabled={controlsDisabled||index===count-1} aria-label={`Опустить ${lesson.subject}`} title="На урок ниже" onClick={()=>onMove(1)}><ArrowDown size={15}/></button></div><div className="schedule-item-actions"><button className="icon-button" disabled={controlsDisabled} aria-label={`Редактировать урок ${lesson.lessonNumber}: ${lesson.subject}`} onClick={onEdit}><Pencil size={16}/></button><button className="icon-button" disabled={controlsDisabled} aria-label={`Удалить урок ${lesson.lessonNumber}: ${lesson.subject}`} onClick={onDelete}><Trash2 size={16}/></button></div></div>}
 </article>;
}

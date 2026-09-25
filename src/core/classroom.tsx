import {createContext,useContext,useState,useEffect,useRef,type ReactNode} from 'react';
import {api} from './api';
export interface Classroom{id:string;name:string;schoolYear:string;teacherId:string}
export interface Student{id:string;classId:string;userId:string;fullName:string;login:string;birthDate:string;parentName:string;parentPhone:string;parentEmail:string;privateNote?:string}
interface ContextValue{classes:Classroom[];classroom:Classroom|null;classId:string;setClassId:(id:string)=>void;students:Student[];student:Student|null;studentId:string;setStudentId:(id:string)=>void;loading:boolean;error:string;refresh:()=>Promise<void>}
const Context=createContext<ContextValue>(null!);
export function ClassroomProvider({children}:{children:ReactNode}){
 const [classes,setClasses]=useState<Classroom[]>([]),[classId,updateClassId]=useState(''),[students,setStudents]=useState<Student[]>([]),[studentId,setStudentId]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const selected=useRef(''),generation=useRef(0);
 async function loadStudents(id:string,version:number){try{const result=id?await api<Student[]>(`/api/classes/${id}/students`):[];if(version!==generation.current)return;setStudents(result);setStudentId(old=>result.some(s=>s.id===old)?old:result[0]?.id||'');}catch(e){if(version===generation.current)setError((e as Error).message);}finally{if(version===generation.current)setLoading(false);}}
 function setClassId(id:string){const version=++generation.current;selected.current=id;updateClassId(id);setStudents([]);setStudentId('');setError('');setLoading(true);void loadStudents(id,version);}
 async function refresh(){const version=++generation.current;setError('');setLoading(true);try{const result=await api<Classroom[]>('/api/classes');if(version!==generation.current)return;setClasses(result);const id=result.some(c=>c.id===selected.current)?selected.current:result[0]?.id||'';if(id!==selected.current){setStudents([]);setStudentId('');}selected.current=id;updateClassId(id);await loadStudents(id,version);}catch(e){if(version===generation.current){setError((e as Error).message);setLoading(false);}}}
 useEffect(()=>{void refresh();return()=>{generation.current++;};},[]);
 return <Context.Provider value={{classes,classId,setClassId,classroom:classes.find(c=>c.id===classId)||null,students,studentId,setStudentId,student:students.find(s=>s.id===studentId)||null,loading,error,refresh}}>{children}</Context.Provider>;
}
export const useClassroom=()=>useContext(Context);

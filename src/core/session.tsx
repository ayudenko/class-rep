import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import {api,ApiError,setBearer} from './api';
export interface User{id:string;name:string;role:'teacher'|'student'|'parent';login:string}
interface Session{user:User|null;loading:boolean;authenticate:(path:string,data:unknown)=>Promise<void>;logout:()=>Promise<void>;clear:()=>void}
const Context=createContext<Session>(null!);
export function SessionProvider({children}:{children:ReactNode}){const [user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true);const clear=()=>{setUser(null);setBearer(null);};useEffect(()=>{window.addEventListener('klassno:unauthorized',clear);let active=true;api<{user:User}>('/api/auth/me').then(r=>{if(active)setUser(r.user);}).catch(()=>{}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;window.removeEventListener('klassno:unauthorized',clear);};},[]);return <Context.Provider value={{user,loading,clear,authenticate:async(path,data)=>{const r=await api<{user:User;token?:string}>(path,{method:'POST',body:JSON.stringify(data)});setBearer(r.token??null);setUser(r.user);},logout:async()=>{try{await api('/api/auth/logout',{method:'POST'});}catch(e){if(!(e instanceof ApiError)||e.status!==401)throw e;}clear();}}}>{children}</Context.Provider>;}
export const useSession=()=>useContext(Context);

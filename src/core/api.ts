let bearer:string|null=null;
export function setBearer(value:string|null){bearer=value;}
export class ApiError extends Error{constructor(message:string,public status:number){super(message);}}
export const isMobile=()=>Boolean((window as unknown as {Capacitor?:{isNativePlatform:()=>boolean}}).Capacitor?.isNativePlatform());
const base=import.meta.env.VITE_API_URL||'';
export async function api<T=void>(path:string,options:RequestInit={}):Promise<T>{let response:Response;try{response=await fetch(base+path,{...options,credentials:'include',headers:{'Content-Type':'application/json',...(isMobile()?{'X-Client':'mobile'}:{}),...(bearer?{Authorization:`Bearer ${bearer}`}:{ }),...options.headers}});}catch{throw new ApiError('Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.',0);}if(!response.ok){if(response.status===401)window.dispatchEvent(new Event('klassno:unauthorized'));const body=await response.json().catch(()=>({}));throw new ApiError(body.error||'Не удалось связаться с сервером',response.status);}return response.status===204?undefined as T:response.json();}

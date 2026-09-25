import {randomBytes,scryptSync,timingSafeEqual,createHash} from 'node:crypto';
export const token=()=>randomBytes(32).toString('base64url');
export const hashToken=value=>createHash('sha256').update(value).digest('hex');
export function hashPassword(password){ const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(password,salt,64).toString('hex'); }
export function checkPassword(password,stored){const [salt,key]=stored.split(':');return timingSafeEqual(Buffer.from(key,'hex'),scryptSync(password,salt,64));}
export class HttpError extends Error{constructor(status,message){super(message);this.status=status;}}
export function text(value,label,max=200,required=true){if(typeof value!=='string'||value.trim().length>max||(required&&!value.trim()))throw new HttpError(400,`Проверьте поле «${label}»`);return value.trim();}
export function password(value){if(typeof value!=='string'||value.length<10||value.length>128)throw new HttpError(400,'Пароль должен содержать от 10 до 128 символов');return value;}
export function date(value,label='Дата',required=true){const v=text(value,label,10,required);if(!v&&!required)return '';if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw new HttpError(400,'Укажите корректную дату');return v;}

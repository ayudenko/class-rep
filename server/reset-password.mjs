import {openDatabase} from './core/db.mjs';
import {token,hashToken} from './core/security.mjs';
const login=process.argv[2];if(!login){console.error('Укажите логин: npm run reset-password -- login');process.exit(1);}
const db=openDatabase(process.env.DB_PATH||'data/klassno.sqlite');const user=db.prepare('SELECT id FROM users WHERE login=?').get(login.toLowerCase());
if(!user){console.error('Аккаунт не найден');db.close();process.exit(1);}
const raw=token();db.prepare('DELETE FROM password_resets WHERE user_id=?').run(user.id);db.prepare('INSERT INTO password_resets VALUES(?,?,?,NULL)').run(hashToken(raw),user.id,new Date(Date.now()+3600000).toISOString());console.log(`${process.env.PUBLIC_URL||'http://localhost:5173'}/#reset=${raw}`);db.close();

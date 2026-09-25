import {spawnSync} from 'node:child_process';
import {loadEnv} from 'vite';
const local=process.argv.includes('--local');
const env={...loadEnv('production',process.cwd(),''),...process.env};
function origin(name){
 const raw=env[name];let url;try{url=new URL(raw);}catch{throw new Error(`${name}: задайте полный HTTPS origin сервера.`);}
 const loopback=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(url.username||url.password||url.search||url.hash||url.pathname!=='/'||(!local&&(url.protocol!=='https:'||loopback||!url.hostname.includes('.')||url.hostname.startsWith('[')||/^(10\.|127\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(url.hostname)||/^(example\.(com|net|org)|.*\.example\.(com|net|org))$/.test(url.hostname)||/\.(example|invalid|test|localhost)$/.test(url.hostname)))|| (local&&(!loopback||!['http:','https:'].includes(url.protocol))))throw new Error(`${name}: требуется ${local?'локальный origin':'публичный HTTPS origin без пути и параметров'}.`);
 env[name]=url.origin;
}
try{
 if(local){env.VITE_API_URL='http://127.0.0.1:3000';env.VITE_WEB_URL='http://localhost:5173';}
 origin('VITE_API_URL');origin('VITE_WEB_URL');env.MOBILE_LOCAL=local?'1':'0';
 const run=(cmd,args,cwd=process.cwd())=>{const r=spawnSync(cmd,args,{cwd,env,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)throw new Error(`${cmd}: сборка остановлена (${r.status}).`);};
 run('npm',['run','build']);run('npx',['cap','sync']);
 if(process.argv.includes('--android'))run('./gradlew',[':app:assembleDebug'],`${process.cwd()}/android`);
 if(process.argv.includes('--ios'))run('xcodebuild',['-project','ios/App/App.xcodeproj','-scheme','App','-sdk','iphonesimulator','-destination','generic/platform=iOS Simulator','-derivedDataPath','ios/build','CODE_SIGNING_ALLOWED=NO','build']);
}catch(e){console.error(e.message);process.exitCode=1;}

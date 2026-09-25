import express from 'express';
import {resolve} from 'node:path';
import {createApp} from './core/app.mjs';
const {app,close}=createApp();app.use(express.static(resolve('dist')));app.get('/{*path}',(req,res)=>res.sendFile(resolve('dist/index.html')));const server=app.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log(`Классно: http://${process.env.HOST||'127.0.0.1'}:${process.env.PORT||3000}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{close();process.exit();}));

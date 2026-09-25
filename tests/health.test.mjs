import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import {createApp} from '../server/core/app.mjs';

test('production health probe needs no session and reveals no account data', async()=>{
 const {app,close}=createApp({dbPath:':memory:',production:true});
 try{const res=await request(app).get('/api/health');assert.equal(res.status,200);assert.deepEqual(res.body,{status:'ok'});assert.equal(res.headers['set-cookie'],undefined);}finally{close();}
});

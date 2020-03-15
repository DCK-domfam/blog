//server generate
require('dotenv').config();
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
//mongoDB 연결 connect 함수 사용
import mongoose from 'mongoose';

import api from './api';
//import createFakeData from './createFakeData';  //가짜데이터 생성 함수

// const Koa = require('koa');
// const Router = require('koa-router');
// const bodyParser = require('koa-bodyparser');
//mongoDB 연결 connect 함수 사용
// const mongoose = require('mongoose');

// const api = require('./api');

//비구조화 할당을 통해 process.env 내부 값에 대한 레퍼런스 만들기
const { PORT, MONGO_URI } = process.env;

//mongodb 연결
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log('Connected to MongoDB');
    //createFakeData();
  })
  .catch(e => {
    console.error(e);
  });

const app = new Koa();
const router = new Router();

//라우터 설정
router.use('/api', api.routes()); //api 라우트 적용

//라우터 적용 전에 bodyparser 적용
app.use(bodyParser());

//use router
router.get('/', ctx => {
  ctx.body = 'home';
});

router.get('/about/:name?', ctx => {
  const { name } = ctx.params;
  //name의 존재 유무에 따라 다른 결과 출력
  ctx.body = name ? `${name}의 소개` : '소개';
});

router.get('/posts', ctx => {
  const { id } = ctx.query;
  //id의 존재 유무에 따라 다른 결과 출력
  ctx.body = id ? `포스트 #${id}` : '포스트 아이디가 없습니다.';
});

//app 인스턴스에 라우터 적용
app.use(router.routes()).use(router.allowedMethods());

//PORT가 지정되어 있지 않다면 4000을 사용
const port = PORT || 4000;
app.listen(port, () => {
  console.log('Listening to port %d', port);
});

//use middleware
// app.use((ctx, next) => {
//   console.log(ctx.url);
//   console.log(1);
//   if (ctx.query.authorized !== '1') {
//     ctx.status = 401;
//     return;
//   }
//   next().then(() => {
//     console.log('END');
//   });
// });

// app.use((ctx, next) => {
//   console.log(2);
//   next();
// });

// app.use(ctx => {
//   ctx.body = 'hello world';
// });

// app.listen(4000, () => {
//   console.log('Listening to port 4000');
// });

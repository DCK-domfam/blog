import Router from 'koa-router';
import posts from './posts';

// const Router = require('koa-router');
// const posts = require('./posts');

const api = new Router();

api.use('/posts', posts.routes());

/*
api.get('/test', ctx => {
    ctx.body = 'test 성공';
});
*/

//라우터를 내보냅니다.
// module.exports = api;
export default api;
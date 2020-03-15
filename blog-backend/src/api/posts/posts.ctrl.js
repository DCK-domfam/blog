import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi'; //request body 검증용 라이브러리

//올바른 ObjectId 검증에 필요한 함수 생성
//api 선언부에 함수 호출하여 사용
const { ObjectId } = mongoose.Types;
export const checkObjectId = (ctx, next) => {
  const { id } = ctx.params;
  if (!ObjectId.isValid(id)) {
    ctx.status = 400; //Bad request
    return;
  }
  return next();
};

/*
  POST /api/posts
  {
    title:'title',
    body:'content',
    tags:['tag1','tag2']
  }
*/

export const write = async ctx => {
  //request 검증
  const schema = Joi.object().keys({
    //객체가 다음 필드를 가지고 있음을 검증
    title: Joi.string().required(), //required가 있으면 필수 항목
    body: Joi.string().required(),
    tags: Joi.array()
      .items(Joi.string())
      .required(), //문자열로 이루어진 배열
  });
  //검증하고 나서 검증 실패인 경우 에러 처리
  const result = Joi.validate(ctx.request.body, schema);
  if (result.error) {
    ctx.status = 400; //Bad request
    ctx.body = result.error;
    return;
  }

  const { title, body, tags } = ctx.request.body;
  const post = new Post({
    title,
    body,
    tags,
  });
  try {
    await post.save();
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/posts
  데이터를 조회할 때는 모델 인스턴스의 find()함수를 사용
*/
export const list = async ctx => {
  //query는 문자열이기 때문에 숫자로 변환해 주어야 합니다.
  //값이 주어지지 않았다면 1을 기본으로 사용합니다.
  const page = parseInt(ctx.request.page || '1', 10);
  console.log(page);

  if (page < 1) {
    ctx.status = 400;
    return;
  }

  try {
    //find()함수를 호출한 후에 exec()를 붙여 주어야 서버에 쿼리를 요청함
    const posts = await Post.find()
      .sort({ _id: -1 }) //key:1 형식으로 작성, 1이면 오름차순, -1이면 내림차순
      .limit(10) //보이는 개수 제한
      .skip((page - 1) * 10) //skip함수에 파라미터를 10 넣어주면 10개를 제외한 다음 데이터를 불러온다.
      .lean()  //인스턴스 형태의 데이터를 변형없이 바로 JSON형태로 조회할 수 있다.
      .exec();
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page', Math.ceil(postCount / 10)); //Last-Page라는 커스텀 HTTP헤더를 설정함.
    
    // !!! 200자 제한 case1 !!!!
    // ctx.body = posts
    //   .map(post => post.toJSON())
    //   .map(post => ({
    //     ...post,
    //     body:
    //       post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
    //   }));

    // !!! 200자 제한 case2 !!!!
    ctx.body = posts      
      .map(post => ({
        ...post,
        body:
          post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
      }));    

  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  GET /api/posts/:id
  특정id를 가진 데이터를 조회할 때는 findById()함수를 사용
*/
export const read = async ctx => {
  const { id } = ctx.params;
  try {
    const post = await Post.findById(id).exec();
    if (!post) {
      ctx.statue = 404; //Not found
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  데이터를 삭제할 때는 여러 종류의함수 사용
  1.remove(): 특정 조건을 만족하는 데이터를 모두 지웁니다.
  2.findbyIdAndRemove(): id를 찾아서 지웁니다.
  3.findOneAndRemove(): 특정 조건을 만족하는 데이터 하나를 찾아서 제거합니다.
  
  DELETE /api/posts/:id
*/
export const remove = async ctx => {
  const { id } = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; //No Connect(성공하기는 했지만 응답할 데이터는 없음)
  } catch (e) {
    ctx.throw(500, e);
  }
};

/*
  update할 때는 findByIdAndUpdate() 함수를 사용
  PATCH /api/posts/:id
  {
    title:'수정',
    body:'수정내용',
    tags:'['수정1','수정2]
  }
*/
export const update = async ctx => {
  const { id } = ctx.params;

  //리퀘스트 바디 체크, write에서 사용한 schema와 비슷, required()가 없다.
  const schema = Joi.object().keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });
  //검증하고 나서 검증 실패인 경우 에러 처리
  const result = Joi.validate(ctx.request.body, schema);
  if (result.error) {
    ctx.status = 400; //Bad Request
    ctx.body - result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, //이 값을 설정하면 업데이트된 데이터를 반환합니다.
      //false일 때는 업데이트 되기 전의 데이터를 반환합니다.
    }).exec();
    if (!post) {
      ctx.statue = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

//=============================================================================================================
//기존 ctrl내용

// let postId = 1; //id의 초기값

// //posts 배열 초기 데이터
// const posts = [
//   {
//     id: 1,
//     title: '제목',
//     body: '내용',
//   },
// ];

// /* 포스트 작성
// POST /api/posts
// {title,body}
// */
// export const write = ctx => {
//   //REST API의 Request Body는 ctx.request.body에서 조회할 수 있습니다
//   const { title, body } = ctx.request.body;
//   postId += 1; //기존 postId 값에 1을 더합니다.
//   const post = { id: postId, title, body };
//   posts.push(post);
//   ctx.body = post;
//   console.log(ctx.body);
// };

// /* 포스트 목록 조회
// GET /api/posts
// */
// export const list = ctx => {
//   ctx.body = posts;
// };

// /* 특정 포스트 조회
// GET /api/posts/:id
// */
// export const read = ctx => {
//   const { id } = ctx.params;
//   //주어진 id 값으로 포스트를 찾습니다.
//   //파라미터로 받아 온 값은 문자열 형식이므로 파라미터를 숫자로 변환하거나
//   //비교할 p.id 값을 문자열로 변경해야 합니다.
//   const post = posts.find(p => p.id.toString() === id);
//   //포스트가 없으면 오류를 반환
//   if (!post) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트가 존재하지 않습니다.',
//     };
//     return;
//   }
//   ctx.body = post;
// };

// /* 특정 포스트 삭제
// DELETE /api/posts/:id
// */
// export const remove = ctx => {
//   const { id } = ctx.params;
//   //해당 id를 가진 post가 몇 번째인지 확인합니다.
//   const index = posts.findIndex(p => p.id.toString() === id);
//   //포스트가 없으면 오류를 반환
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트가 존재하지 않습니다.',
//     };
//     return;
//   }
//   //index번째 아이템을 제거합니다.
//   posts.splice(index, 1);
//   ctx.status = 204; //No Content
// };

// /* 포스트 수정(교체)
// PUT /api/posts/:id
// { title, body }
// */
// export const replace = ctx => {
//   //PUT 메소드는 전체 포스트 정보를 입력하여 데이터를 통째로 교체할 때 사용합니다.
//   const { id } = ctx.params;
//   //해당 id를 가진 post가 몇 번째인지 확인합니다.
//   const index = posts.findIndex(p => p.id.toString() === id);
//   //포스트가 없으면 오류를 반환
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트가 존재하지 않습니다.',
//     };
//     return;
//   }
//   //전체 객체를 덮어 씌웁니다.
//   //따라서 id를 제외한 기존 정보를 날리고, 객체를 새로 만듭니다.
//   posts[index] = {
//     id,
//     ...ctx.request.body,
//   };
//   ctx.body = posts[index];
// };

// /* 포스트 수정(특정 필드 변경)
// PATCH /api/posts/:id
// { title, body }
// */
// export const update = ctx => {
//   //PATCH 메서드는 주어진 필드만 교체합니다.
//   const { id } = ctx.params;
//   //해당 id를 가진 post가 몇 번째인지 확인합니다.
//   const index = posts.findIndex(p => p.id.toString() === id);
//   //포스트가 없으면 오류를 반환
//   if (index === -1) {
//     ctx.status = 404;
//     ctx.body = {
//       message: '포스트가 존재하지 앖습니다.',
//     };
//     return;
//   }
//   //기존 값에 정보를 덮어 씌웁니다.
//   posts[index] = {
//     ...posts[index],
//     ...ctx.request.body,
//   };
//   ctx.body = posts[index];
// };

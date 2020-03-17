//로그인해야만 글쓰기, 수정, 삭제할 수 있도록 구현하는 미들웨어
const checkLoggedIn = (ctx,next) => {
    if(!ctx.state.user){
        ctx.status = 401; //Unauthorize
        return;
    }
    return next();
};

export default checkLoggedIn;
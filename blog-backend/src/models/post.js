//스키마를 만들 때는 mongoose 모듈의 Schema를 사용하여 정의
import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema({
    title:String,
    body:String,
    tags:[String], //문자열로 이루어진 배열
    publishedData:{
        type:Date,
        default:Date.now,   //현재 날짜를 기본값으로 지정
    },
});

//모델을 만들 때는 mongoose.model 함수를 사용
//model()함수는 기본적으로 2개의 파라미터 필요
//1.스키마 이름, 2.스키마객체
const Post = mongoose.model('Post', PostSchema);
export default Post;
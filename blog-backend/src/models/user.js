import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'; // hashedpassword 생성
import { func } from 'joi';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  username: String,
  hashedPassword: String,
});

//password 생성
UserSchema.methods.setPassword = async function(password) {
  const hash = await bcrypt.hash(password, 10);
  this.hashedPassword = hash;
};

//password 비교
UserSchema.methods.checkPassword = async function(password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result; // true or false
};

//username으로 데이터를 찾게 해주는 스태틱 메소드
UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

//hashedPassword를 JSON으로 변환하여 필드를 삭제하는 serialize 함수
UserSchema.methods.serialize = function() {
  const data = this.toJSON();
  delete data.hashedPassword;
  return data;
};

//token 생성
UserSchema.methods.generateToken = function() {
  const token = jwt.sign(
    //첫 번째 파라미터에는 토큰 안에 집어넣고 싶은 데이터를 넣습니다.
    {
      _id: this.id,
      username: this.username,
    },
    process.env.JWT_SECRET, //두 번째 파라미터에는 JWT 암호를 넣습니다.
    {
      expiresIn: '7d', // 7일 동안 유효함
    },
  );
  return token;
};

const User = mongoose.model('User', UserSchema);

export default User;

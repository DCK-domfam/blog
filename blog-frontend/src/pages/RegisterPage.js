import React from 'react';
import AuthTemplate from '../components/auth/AuthTemplate';
// import AuthForm from '../components/auth/AuthForm';
import RegisterForm from '../containers/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthTemplate>
      {/* <AuthForm type="register"/> */}
      <RegisterForm />
    </AuthTemplate>
  );
};

export default RegisterPage;

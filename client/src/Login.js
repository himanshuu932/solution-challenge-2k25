import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      username: e.target.username?.value || '',
      email: e.target.email.value,
      password: e.target.password.value,
    };

    console.log("Form Submitted:", formData);

    const url = isLogin ? '/api/auth/login' : '/api/auth/signup';
    console.log("API Endpoint:", url);

    try {
      const res = await axios.post(url, formData);
      console.log("API Response:", res.data);

      setMessage(isLogin ? 'Login Successful!' : 'Signup Successful!');
      localStorage.setItem('token', res.data.token);
    } catch (err) {
     // console.error("API Error:", err.response);

      // Handle "User already exists" and auto-login
      if (!isLogin && err.response?.data?.msg === 'User already exists') {
        try {
          const loginRes = await axios.post('/api/auth/login', {
            email: formData.email,
            password: formData.password,
          });
          console.log("Auto Login Response:", loginRes.data);

          setMessage('User already exists. Logged you in!');
          localStorage.setItem('token', loginRes.data.token);
        } catch (loginErr) {
          console.error("Auto Login Error:", loginErr.response);
          setMessage('User exists, but login failed. Check password.');
        }
      } else {
        setMessage(err.response?.data?.msg || 'An error occurred');
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Signup'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input type="text" name="username" placeholder="UserName" required={!isLogin} />
          )}
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />
          <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
        </form>

        <p>
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
            {isLogin ? 'Signup' : 'Login'}
          </button>
        </p>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default Auth;

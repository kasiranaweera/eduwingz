import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function GoogleLoginButton() {
  const onSuccess = async (credentialResponse) => {
    try {
      // Decode the credential to get ID token
      const decoded = jwtDecode(credentialResponse.credential);
      
      const res = await axios.post('http://127.0.0.1:8000/users/google-login/', {
        id_token: credentialResponse.credential
      });
      
      // Store tokens
      localStorage.setItem('access_token', res.data.tokens.access);
      localStorage.setItem('refresh_token', res.data.tokens.refresh);
      
      // Optional: Log user information
      console.log('Logged in user:', decoded);
      
      // Handle successful login (redirect, update state, etc.)
    } catch (error) {
      console.error('Google login failed', error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={onSuccess}
      onError={() => {
        console.log('Login Failed');
      }}
    />
  );
}

export default GoogleLoginButton;
import React from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
  const token = credentialResponse.credential;

  if (!token) {
    console.error("No credential received from Google.");
    return;
  }

  try {
    const res = await fetch('http://localhost:8000/api/auth/google/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (res.ok) {
      // Save JWT tokens to localStorage
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      console.log("Login successful, tokens stored.");
    } else {
      console.error("Login failed:", data.error || data);
    }
  } catch (error) {
    console.error("Error during fetch:", error);
  }
};

const GoogleButton: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId="118141395309-o72kvp8k20ooj7gg0trjo3gmmme4g1eo.apps.googleusercontent.com">
      <div className="w-full mb-6 ">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => console.error('Google login failed')}
          useOneTap={false}
          size="large"
          width="100%"
          logo_alignment='center'
          shape="rectangular"
          text="signin_with"
          context="signin"
        />
      </div>
      
    </GoogleOAuthProvider>
  );
};

export default GoogleButton;
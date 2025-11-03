import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, Loader2 } from 'lucide-react';

const LoginButton: React.FC = () => {
  const { loginWithRedirect, isLoading } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      },
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="btn-primary px-6 py-2.5 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          Log In
        </>
      )}
    </button>
  );
};

export default LoginButton;
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogIn, Loader2 } from 'lucide-react';
import Button from './Button';

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
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="px-6 py-2.5 font-semibold shadow-md hover:shadow-lg"
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
    </Button>
  );
};

export default LoginButton;
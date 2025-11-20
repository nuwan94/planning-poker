import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogOut, Loader2 } from 'lucide-react';
import Button from './Button';

const LogoutButton: React.FC = () => {
  const { logout, isLoading } = useAuth0();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('planningPokerUser');

    logout({
      logoutParams: {
        returnTo: globalThis.location.origin,
      },
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      disabled={isLoading}
      className="p-2.5 rounded-xl hover:bg-red-50 hover:text-red-600"
      title="Log Out"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5" />
      )}
    </Button>
  );
};

export default LogoutButton;
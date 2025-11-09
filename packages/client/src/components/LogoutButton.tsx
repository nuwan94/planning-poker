import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { LogOut, Loader2 } from 'lucide-react';

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
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="btn-ghost p-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
      title="Log Out"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5" />
      )}
    </button>
  );
};

export default LogoutButton;
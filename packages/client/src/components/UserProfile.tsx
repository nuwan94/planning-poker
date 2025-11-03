import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { User, Loader2 } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors duration-200">
      <div className="flex items-center gap-3">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm">
            {user.name ? getInitials(user.name) : <User className="w-4 h-4" />}
          </div>
        )}
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            {user.name || user.email}
          </p>
          {user.name && user.email && (
            <p className="text-xs text-slate-500 leading-tight mt-0.5">{user.email}</p>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-slate-500">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
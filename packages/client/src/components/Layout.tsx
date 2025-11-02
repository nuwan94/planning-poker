import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface RoomInfo {
  id: string;
  name: string;
  participantCount: number;
}

interface LayoutContextType {
  setRoomInfo: (roomInfo: RoomInfo | null) => void;
  setLeaveRoomHandler: (handler: (() => void) | null) => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export const useLayoutContext = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a Layout');
  }
  return context;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [leaveRoomHandler, setLeaveRoomHandler] = useState<(() => void) | null>(null);

  // Check for logged-in user
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('planningPokerUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkUser();

    // Listen for storage changes (if user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'planningPokerUser') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [location]);

  // Determine if navbar should be shown
  const shouldShowNavbar = () => {
    // Show navbar if user is logged in
    if (user) return true;
    
    // Don't show navbar on home page when not logged in
    if (location.pathname === '/' && !user) return false;
    
    // Show navbar on other pages (like create-room)
    return true;
  };

  const handleLogout = () => {
    setUser(null);
  };

  const contextValue: LayoutContextType = {
    setRoomInfo: (newRoomInfo: RoomInfo | null) => {
      setRoomInfo(newRoomInfo);
    },
    setLeaveRoomHandler: (handler: (() => void) | null) => {
      setLeaveRoomHandler(handler);
    }
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {shouldShowNavbar() && (
          <Navbar 
            user={user || undefined} 
            roomInfo={roomInfo || undefined}
            onLogout={handleLogout}
            onLeaveRoom={leaveRoomHandler || undefined}
          />
        )}
        <main className={shouldShowNavbar() ? '' : 'pt-0'}>
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
};

export default Layout;
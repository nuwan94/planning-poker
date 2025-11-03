import React, { useState, createContext, useContext } from 'react';

import NavbarWithModals from './Navbar';

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
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [leaveRoomHandler, setLeaveRoomHandler] = useState<(() => void) | null>(null);

  // Always show navbar
  const shouldShowNavbar = () => {
    return true;
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
          <NavbarWithModals 
            roomInfo={roomInfo || undefined}
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
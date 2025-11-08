import React from 'react';
import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import CreateRoomPage from './pages/CreateRoomPage';
import RoomPage from './pages/RoomPage';
import MyRoomsPage from './pages/MyRoomsPage';
import NotFoundPage from './pages/NotFoundPage';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { SocketProvider } from './contexts/SocketContext';
import Auth0ProviderWithConfig from './auth/Auth0ProviderWithConfig';

const App: React.FC = () => {
  return (
    <Auth0ProviderWithConfig>
      <ScrollToTop />
      <SocketProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create-room" element={<CreateRoomPage />} />
            <Route path="/my-rooms" element={<MyRoomsPage />} />
            <Route path="/room/:id" element={<RoomPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </SocketProvider>
    </Auth0ProviderWithConfig>
  );
};

export default App;
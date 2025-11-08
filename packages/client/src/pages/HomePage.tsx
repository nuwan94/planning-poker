import React, { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

const HomePage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-content max-w-7xl mx-auto">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-stretch min-h-[100vh] py-12">
          
          {/* Left Side - CTAs */}
          <div className="space-y-8 animate-slide-up flex flex-col justify-center">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Planning Poker
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8">
                Estimate user stories with your team in real-time
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-10 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 group w-full sm:w-auto"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
                Create New Room
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary px-10 py-6 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group w-full sm:w-auto"
              >
                <Users className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                Join Existing Room
              </button>
            </div>
          </div>

          {/* Right Side - Video/GIF with 3D Tilt */}
          <div className="relative perspective-1000 animate-slide-up flex flex-col" style={{ animationDelay: '0.2s' }}>
            <div className="card-elevated p-6 transform rotate-y-12 hover:rotate-y-6 transition-transform duration-500 shadow-2xl max-w-md mx-auto">
              <div className="bg-slate-100 rounded-lg overflow-hidden relative aspect-video">
                {/* Temporary placeholder - Replace with actual video/gif */}
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary-100 to-purple-100">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      Demo Video/GIF Coming Soon
                    </p>
                    <p className="text-sm text-slate-500">
                      Add your video or GIF here
                    </p>
                  </div>
                </div>
                
                {/* Uncomment this when you have a video/gif */}
                {/* 
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
                */}
                
                {/* Or use a GIF */}
                {/* <img src="/demo.gif" alt="Planning Poker Demo" className="w-full h-full object-cover" /> */}
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateRoomModal
            isOpen={showCreateModal}
            onClose={handleModalClose}
          />
        )}
        {showJoinModal && (
          <JoinRoomModal
            isOpen={showJoinModal}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;

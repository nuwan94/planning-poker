import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Clock, Zap, Users2, Vote, Briefcase } from 'lucide-react';
import CreateRoomModal from '../components/CreateRoomModal';
import JoinRoomModal from '../components/JoinRoomModal';

const HomePage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user from localStorage
    const savedUser = localStorage.getItem('planningPokerUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setCurrentUserId(userData.id);
    }
  }, []);

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowJoinModal(false);
  };

  return (
    <div className="page-container">
      <div className="page-content">
        {/* Hero Section */}
        <div className="page-header animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-8 shadow-lg shadow-primary-500/25">
            <Vote className="w-10 h-10 text-white" />
          </div>
          <h1 className="page-title">
            Planning Poker
          </h1>
          <p className="page-subtitle">
            Estimate user stories with your team in real-time. Create or join a room to get started with collaborative planning sessions.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 animate-slide-up">
          <div className="card p-6 text-center group hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Voting</h3>
            <p className="text-slate-600 text-sm">Vote on user stories simultaneously with your team members and see results instantly.</p>
          </div>

          <div className="card p-6 text-center group hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200">
              <Users2 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Team Collaboration</h3>
            <p className="text-slate-600 text-sm">Work together with unlimited participants in a shared planning environment.</p>
          </div>

          <div className="card p-6 text-center group hover:scale-105 transition-transform duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-200">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Setup</h3>
            <p className="text-slate-600 text-sm">Get started in seconds. No registration required, just enter your name and start estimating.</p>
          </div>
        </div>

        {/* My Rooms Link - Show if user has logged in */}
        {currentUserId && (
          <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="card p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">View Your Rooms</h3>
              <p className="text-slate-600 mb-6">
                Access all the planning poker rooms you've created
              </p>
              <button
                onClick={() => navigate('/my-rooms')}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Go to My Rooms
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="text-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="card-elevated p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Ready to Get Started?</h3>
            <p className="text-slate-600 mb-8">
              Choose an option below to begin your planning poker session.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
                Create New Room
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary px-8 py-4 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                Join Existing Room
              </button>
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
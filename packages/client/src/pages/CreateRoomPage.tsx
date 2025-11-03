import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Loader2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import toast from 'react-hot-toast';

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    // Get owner information from localStorage
    const storedUser = localStorage.getItem('planningPokerUser');
    if (!storedUser) {
      toast.error('User information not found. Please go back to home page.');
      navigate('/');
      return;
    }

    const userData = JSON.parse(storedUser);
    const owner = {
      id: userData.id,
      name: userData.name,
      isSpectator: false
    };

    setIsLoading(true);
    
    try {
      const room = await apiClient.createRoom({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        owner
      });
      
      toast.success('Room created successfully!');
      navigate(`/room/${room.id}`);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="page-container">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg shadow-primary-500/25">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Create Planning Room
          </h1>
          <p className="text-lg text-slate-600 max-w-lg mx-auto">
            Set up a new planning poker session for your team and start estimating user stories together.
          </p>
        </div>

        <div className="card-elevated p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="form-group">
                <label htmlFor="name" className="label">
                  Room Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Sprint Planning - Q4 2024"
                  maxLength={100}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description" className="label">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="input resize-none"
                  placeholder="Estimate user stories for the upcoming sprint..."
                  maxLength={500}
                  disabled={isLoading}
                />
                <div className="text-xs text-slate-500 mt-1">
                  {formData.description.length}/500 characters
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={isLoading}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  <>
                    Create Room
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-slate-500">
              Once created, you can share the room link with your team members to start collaborative estimation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
import { 
  Room, 
  Story, 
  CreateRoomRequest, 
  UpdateRoomRequest, 
  CreateStoryRequest, 
  UpdateStoryRequest,
  ApiResponse
} from '@planning-poker/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Room API methods
  async getRooms(): Promise<Room[]> {
    const response = await this.request<Room[]>('/api/rooms');
    return response.data || [];
  }

  async getRoom(roomId: string): Promise<Room | null> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 API: Getting room');
    console.log('  Room ID:', roomId);
    console.log('  URL:', `${API_BASE_URL}/api/rooms/${roomId}`);
    
    try {
      const response = await this.request<Room>(`/api/rooms/${roomId}`);
      console.log('✅ API: Room received');
      console.log('  Response:', JSON.stringify(response, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return response.data || null;
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ API: Failed to get room');
      console.error('  Error:', error);
      console.error('  Message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return null;
    }
  }

  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 API: Creating room');
    console.log('  Room data:', JSON.stringify(roomData, null, 2));
    console.log('  URL:', `${API_BASE_URL}/api/rooms`);
    
    const response = await this.request<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
    
    if (!response.success || !response.data) {
      console.error('❌ API: Failed to create room');
      console.error('  Response:', response);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error(response.message || 'Failed to create room');
    }
    
    console.log('✅ API: Room created');
    console.log('  Room ID:', response.data.id);
    console.log('  Room:', JSON.stringify(response.data, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return response.data;
  }

  async updateRoom(roomId: string, updates: UpdateRoomRequest): Promise<Room> {
    const response = await this.request<Room>(`/api/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update room');
    }
    
    return response.data;
  }

  async deleteRoom(roomId: string): Promise<void> {
    const response = await this.request(`/api/rooms/${roomId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete room');
    }
  }

  async joinRoom(roomId: string, userData: { name: string; isSpectator?: boolean }): Promise<Room> {
    const response = await this.request<Room>(`/api/rooms/${roomId}/join`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to join room');
    }
    
    return response.data;
  }

  async leaveRoom(roomId: string, userId: string): Promise<Room> {
    const response = await this.request<Room>(`/api/rooms/${roomId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to leave room');
    }
    
    return response.data;
  }

  // Story API methods
  async getStoriesForRoom(roomId: string): Promise<Story[]> {
    const response = await this.request<Story[]>(`/api/stories?roomId=${roomId}`);
    return response.data || [];
  }

  async getStory(storyId: string): Promise<Story | null> {
    try {
      const response = await this.request<Story>(`/api/stories/${storyId}`);
      return response.data || null;
    } catch (error) {
      console.error('Failed to get story:', error);
      return null;
    }
  }

  async createStory(storyData: CreateStoryRequest): Promise<Story> {
    const response = await this.request<Story>('/api/stories', {
      method: 'POST',
      body: JSON.stringify(storyData),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create story');
    }
    
    return response.data;
  }

  async updateStory(storyId: string, updates: UpdateStoryRequest): Promise<Story> {
    const response = await this.request<Story>(`/api/stories/${storyId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update story');
    }
    
    return response.data;
  }

  async deleteStory(storyId: string): Promise<void> {
    const response = await this.request(`/api/stories/${storyId}`, {
      method: 'DELETE',
    });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete story');
    }
  }

  async submitVote(storyId: string, vote: { userId: string; value: string }): Promise<Story> {
    const response = await this.request<Story>(`/api/stories/${storyId}/vote`, {
      method: 'POST',
      body: JSON.stringify(vote),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to submit vote');
    }
    
    return response.data;
  }

  async revealVotes(storyId: string): Promise<Story> {
    const response = await this.request<Story>(`/api/stories/${storyId}/reveal`, {
      method: 'POST',
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to reveal votes');
    }
    
    return response.data;
  }

  async clearVotes(storyId: string): Promise<Story> {
    const response = await this.request<Story>(`/api/stories/${storyId}/clear-votes`, {
      method: 'POST',
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to clear votes');
    }
    
    return response.data;
  }

  async setFinalEstimate(storyId: string, estimate: string): Promise<Story> {
    const response = await this.request<Story>(`/api/stories/${storyId}/estimate`, {
      method: 'POST',
      body: JSON.stringify({ estimate }),
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to set final estimate');
    }
    
    return response.data;
  }
}

export const apiClient = new ApiClient();
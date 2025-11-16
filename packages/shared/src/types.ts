// User related types
export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  isSpectator: boolean;
}

// Room related types
export interface Room {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  participants: User[];
  currentStory?: Story;
  storyHistory?: Story[];
  cardDeckId?: string;
  isVotingActive: boolean;
  isPasswordProtected?: boolean; // Indicates if room has password protection
  timerDuration?: number; // Default timer duration in seconds (0 = disabled)
  createdAt: Date;
  updatedAt: Date;
}

// Story/Task related types
export interface Story {
  id: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string[];
  finalEstimate?: string;
  votes: Vote[];
  isRevealed: boolean;
  timer?: TimerState;
  createdAt: Date;
}

// Timer related types
export interface TimerState {
  duration: number; // Total duration in seconds
  remaining: number; // Remaining time in seconds
  isActive: boolean;
  isPaused: boolean;
  startedAt?: Date;
}

// Vote related types
export interface Vote {
  userId: string;
  value: string;
  submittedAt: Date;
}

// Card deck types
export interface CardDeck {
  id: string;
  name: string;
  values: string[];
}

// Socket event types
export interface SocketEvents {
  // Room events
  joinRoom: (roomId: string, user: User, password?: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  userJoined: (user: User) => void;
  userLeft: (userId: string) => void;
  
  // Voting events
  startVoting: (story: Story) => void;
  submitVote: (vote: Omit<Vote, 'submittedAt'>) => void;
  voteSubmitted: (userId: string) => void;
  revealVotes: () => void;
  votesRevealed: (votes: Vote[]) => void;
  clearVotes: () => void;
  votesCleared: () => void;
  
  // Timer events
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  timerTick: (remaining: number) => void;
  timerComplete: () => void;
  timerUpdated: (timer: TimerState) => void;
  
  // Story events
  updateStory: (story: Partial<Story>) => void;
  storyUpdated: (story: Story) => void;
  
  // General events
  error: (message: string) => void;
  roomUpdated: (room: Room) => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// Room creation/update types
export interface CreateRoomRequest {
  name: string;
  description?: string;
  cardDeckId?: string;
  password?: string; // Optional password for protected rooms
  timerDuration?: number; // Default timer duration in seconds (0 = disabled)
  owner?: User;
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  cardDeckId?: string;
  timerDuration?: number;
}

// Room join types
export interface JoinRoomRequest {
  name: string;
  isSpectator?: boolean;
  password?: string; // Password for protected rooms
}

// Story creation/update types
export interface CreateStoryRequest {
  title: string;
  description?: string;
  acceptanceCriteria?: string[];
  roomId: string;
}

export interface UpdateStoryRequest {
  title?: string;
  description?: string;
  acceptanceCriteria?: string[];
  finalEstimate?: string;
  timer?: TimerState;
}
// Predefined card decks for estimation
export const CARD_DECKS = {
  FIBONACCI: {
    id: 'fibonacci',
    name: 'Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕']
  },
  MODIFIED_FIBONACCI: {
    id: 'modified-fibonacci',
    name: 'Modified Fibonacci',
    values: ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '?', '☕']
  },
  T_SHIRT: {
    id: 't-shirt',
    name: 'T-Shirt Sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕']
  },
  POWERS_OF_2: {
    id: 'powers-of-2',
    name: 'Powers of 2',
    values: ['0', '1', '2', '4', '8', '16', '32', '?', '☕']
  }
} as const;

// Socket event names
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Room management
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_JOINED: 'room_joined',
  ROOM_LEFT: 'room_left',
  ROOM_UPDATED: 'room_updated',
  REMOVE_USER: 'remove_user',
  
  // Voting
  VOTING_STARTED: 'voting_started',
  VOTE_SUBMITTED: 'vote_submitted',
  VOTES_REVEALED: 'votes_revealed',
  VOTES_CLEARED: 'votes_cleared',
  
  // Stories
  STORY_CREATED: 'story_created',
  STORY_UPDATED: 'story_updated',
  
  // Final estimate
  FINAL_ESTIMATE_SET: 'final_estimate_set',
  
  // Errors
  ERROR: 'error'
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

// API endpoints
export const API_ENDPOINTS = {
  ROOMS: '/api/rooms',
  STORIES: '/api/stories',
  USERS: '/api/users'
} as const;

// Validation constants
export const VALIDATION = {
  ROOM_NAME_MAX_LENGTH: 100,
  ROOM_DESCRIPTION_MAX_LENGTH: 500,
  STORY_TITLE_MAX_LENGTH: 200,
  STORY_DESCRIPTION_MAX_LENGTH: 1000,
  USER_NAME_MAX_LENGTH: 50,
  MAX_PARTICIPANTS: 20
} as const;
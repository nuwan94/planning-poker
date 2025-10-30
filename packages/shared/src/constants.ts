// Predefined card decks for estimation
export const CARD_DECKS = {
  FIBONACCI: {
    id: 'fibonacci',
    name: 'Fibonacci',
    values: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕']
  },
  MODIFIED_FIBONACCI: {
    id: 'modified-fibonacci',
    name: 'Modified Fibonacci',
    values: ['0', '0.5', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕']
  },
  T_SHIRT: {
    id: 't-shirt',
    name: 'T-Shirt Sizes',
    values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕']
  },
  POWERS_OF_2: {
    id: 'powers-of-2',
    name: 'Powers of 2',
    values: ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕']
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
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROOM_UPDATED: 'room_updated',
  
  // Voting
  START_VOTING: 'start_voting',
  SUBMIT_VOTE: 'submit_vote',
  VOTE_SUBMITTED: 'vote_submitted',
  REVEAL_VOTES: 'reveal_votes',
  VOTES_REVEALED: 'votes_revealed',
  CLEAR_VOTES: 'clear_votes',
  VOTES_CLEARED: 'votes_cleared',
  
  // Stories
  UPDATE_STORY: 'update_story',
  STORY_UPDATED: 'story_updated',
  
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
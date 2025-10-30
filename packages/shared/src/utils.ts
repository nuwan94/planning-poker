import { VALIDATION } from './constants';

// Validation utilities
export const validateRoomName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= VALIDATION.ROOM_NAME_MAX_LENGTH;
};

export const validateStoryTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.length <= VALIDATION.STORY_TITLE_MAX_LENGTH;
};

export const validateUserName = (name: string): boolean => {
  return name.trim().length > 0 && name.length <= VALIDATION.USER_NAME_MAX_LENGTH;
};

// ID generation utility
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Date utilities
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Vote calculation utilities
export const calculateAverage = (votes: string[]): number | null => {
  const numericVotes = votes
    .filter(vote => !isNaN(Number(vote)) && vote !== '?' && vote !== '☕')
    .map(Number);
  
  if (numericVotes.length === 0) return null;
  
  return numericVotes.reduce((sum, vote) => sum + vote, 0) / numericVotes.length;
};

export const findMostCommonVote = (votes: string[]): string | null => {
  if (votes.length === 0) return null;
  
  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote] = (acc[vote] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxCount = Math.max(...Object.values(voteCounts));
  const mostCommon = Object.entries(voteCounts)
    .filter(([, count]) => count === maxCount)
    .map(([vote]) => vote);
  
  return mostCommon.length === 1 ? mostCommon[0] : null;
};

// URL utilities
export const createRoomUrl = (roomId: string): string => {
  return `${window.location.origin}/room/${roomId}`;
};

// Local storage utilities
export const saveToLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};
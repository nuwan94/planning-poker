import { VALIDATION, CARD_DECKS } from './constants';

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

// Simple room ID generation (6 characters, alphanumeric)
export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
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

// Fibonacci number utilities
export const FIBONACCI_SEQUENCE = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

export const isFibonacciNumber = (value: string | number): boolean => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return false;
  return FIBONACCI_SEQUENCE.includes(num);
};

export const isValidCardValue = (value: string, deckId: string = 'fibonacci'): boolean => {
  // Special values are not valid for final estimates
  if (value === '?' || value === '☕') return false;
  
  // Find the deck
  const deck = Object.values(CARD_DECKS).find((d: any) => d.id === deckId);
  if (!deck) return false;
  
  // Check if value is in the deck and not a special value
  return (deck as any).values.includes(value) && value !== '?' && value !== '☕';
};

export const findNearestFibonacci = (value: number): string => {
  if (isNaN(value) || value < 0) return '0';
  if (value === 0) return '0';
  
  // Find the closest Fibonacci number
  let nearest = FIBONACCI_SEQUENCE[0];
  let minDiff = Math.abs(value - nearest);
  
  for (const fib of FIBONACCI_SEQUENCE) {
    const diff = Math.abs(value - fib);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = fib;
    }
  }
  
  return nearest.toString();
};

export const findNearestCardValue = (value: number, deckId: string = 'fibonacci'): string => {
  if (isNaN(value) || value < 0) return '0';
  
  // Find the deck
  const deck = Object.values(CARD_DECKS).find((d: any) => d.id === deckId);
  if (!deck) return findNearestFibonacci(value);
  
  // Filter numeric values from the deck (exclude ?, ☕)
  const numericValues = (deck as any).values
    .filter((v: string) => v !== '?' && v !== '☕' && !isNaN(parseFloat(v)))
    .map((v: string) => parseFloat(v))
    .sort((a: number, b: number) => a - b);
  
  if (numericValues.length === 0) return '0';
  
  // Find closest value
  let nearest = numericValues[0];
  let minDiff = Math.abs(value - nearest);
  
  for (const val of numericValues) {
    const diff = Math.abs(value - val);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = val;
    }
  }
  
  return nearest.toString();
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
// Simple store for managing app state with localStorage persistence
export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  dailyCalorieTarget: number;
  dailyStepsTarget: number;
}

export interface FoodLog {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface ActivityLog {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  distance?: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  liked: boolean;
  comments: number;
  timestamp: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  endDate: string;
  progress: number;
  icon: string;
}

const STORAGE_KEY = 'pathra_app_state';

export const getStoredData = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveData = (data: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

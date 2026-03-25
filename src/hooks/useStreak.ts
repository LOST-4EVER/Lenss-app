import { useState, useEffect, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getAllPhotos } from '../utils/storage';

const STREAK_KEY = 'daily_photo_streak';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);
  const [hasTakenToday, setHasTakenToday] = useState(false);

  const calculateStreak = useCallback(async () => {
    try {
      const photos = await getAllPhotos();
      if (photos.length === 0) {
        setStreak(0);
        setHasTakenToday(false);
        return;
      }

      const todayStr = new Date().toDateString();
      const lastPhotoDateStr = new Date(photos[0].timestamp).toDateString();
      
      const isTodayCaptured = todayStr === lastPhotoDateStr;
      setHasTakenToday(isTodayCaptured);

      // Calculate streak logic efficiently
      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      const photoDates = new Set(photos.map(p => new Date(p.timestamp).toDateString()));

      // If today's photo is missing, start checking from yesterday
      if (!photoDates.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (photoDates.has(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      setStreak(currentStreak);
      await SecureStore.setItemAsync(STREAK_KEY, currentStreak.toString());
    } catch (error) {
      console.error('Streak calculation failed:', error);
    }
  }, []);

  useEffect(() => {
    calculateStreak();
  }, [calculateStreak]);

  return useMemo(() => ({ 
    streak, 
    hasTakenToday, 
    refreshStreak: calculateStreak 
  }), [streak, hasTakenToday, calculateStreak]);
};

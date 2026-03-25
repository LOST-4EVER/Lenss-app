import { useState, useEffect, useCallback, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getAllPhotos } from '../utils/storage';
import { STREAK_KEY } from '../constants';

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

      const now = new Date();
      const todayStr = now.toDateString();
      
      // Ensure we compare based on local date string for consistency
      const lastPhotoDateStr = new Date(photos[0].timestamp.replace(' ', 'T') + 'Z').toDateString();
      
      const isTodayCaptured = todayStr === lastPhotoDateStr;
      setHasTakenToday(isTodayCaptured);

      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      // Create a set of local date strings for efficient lookup
      const photoDates = new Set(photos.map(p => 
        new Date(p.timestamp.replace(' ', 'T') + 'Z').toDateString()
      ));

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

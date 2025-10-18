import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PracticeContext = createContext();

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

export const PracticeProvider = ({ children }) => {
  const [prayerProgress, setPrayerProgress] = useState([]);
  const [quranProgress, setQuranProgress] = useState([]);
  const [dhikrProgress, setDhikrProgress] = useState([]);
  const { user } = useAuth();

  // Load progress from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedPrayerProgress = localStorage.getItem(`muslimDiary_prayerProgress_${user.id}`);
      const savedQuranProgress = localStorage.getItem(`muslimDiary_quranProgress_${user.id}`);
      const savedDhikrProgress = localStorage.getItem(`muslimDiary_dhikrProgress_${user.id}`);

      if (savedPrayerProgress) setPrayerProgress(JSON.parse(savedPrayerProgress));
      if (savedQuranProgress) setQuranProgress(JSON.parse(savedQuranProgress));
      if (savedDhikrProgress) setDhikrProgress(JSON.parse(savedDhikrProgress));
    }
  }, [user]);

  const trackPrayer = async (prayerName) => {
    if (!user) throw new Error('User must be logged in to track prayers');

    const newPrayerRecord = {
      id: Date.now(),
      name: prayerName,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    const updatedProgress = [...prayerProgress, newPrayerRecord];
    setPrayerProgress(updatedProgress);
    
    // Save to localStorage
    localStorage.setItem(`muslimDiary_prayerProgress_${user.id}`, JSON.stringify(updatedProgress));
    
    return newPrayerRecord;
  };

  const trackQuran = async (pagesRead, surah) => {
    if (!user) throw new Error('User must be logged in to track Quran reading');

    const newQuranRecord = {
      id: Date.now(),
      pagesRead,
      surah,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    const updatedProgress = [...quranProgress, newQuranRecord];
    setQuranProgress(updatedProgress);
    localStorage.setItem(`muslimDiary_quranProgress_${user.id}`, JSON.stringify(updatedProgress));
    
    return newQuranRecord;
  };

  const trackDhikr = async (dhikrType, count) => {
    if (!user) throw new Error('User must be logged in to track Dhikr');

    const newDhikrRecord = {
      id: Date.now(),
      type: dhikrType,
      count,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    const updatedProgress = [...dhikrProgress, newDhikrRecord];
    setDhikrProgress(updatedProgress);
    localStorage.setItem(`muslimDiary_dhikrProgress_${user.id}`, JSON.stringify(updatedProgress));
    
    return newDhikrRecord;
  };

  const getTodayPrayers = () => {
    const today = new Date().toDateString();
    return prayerProgress.filter(record => record.date === today);
  };

  const getWeeklyProgress = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return prayerProgress.filter(record => new Date(record.timestamp) > oneWeekAgo);
  };

  const value = {
    prayerProgress,
    quranProgress,
    dhikrProgress,
    trackPrayer,
    trackQuran,
    trackDhikr,
    getTodayPrayers,
    getWeeklyProgress
  };

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
};
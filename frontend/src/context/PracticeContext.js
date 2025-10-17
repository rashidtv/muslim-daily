import React, { createContext, useState, useContext, useEffect } from 'react';

const PracticeContext = createContext();

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

export const PracticeProvider = ({ children }) => {
  const [prayerProgress, setPrayerProgress] = useState({});
  const [quranProgress, setQuranProgress] = useState(0);
  const [dhikrCount, setDhikrCount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('muslimDiary_progress');
    if (savedProgress) {
      const { prayerProgress: savedPrayers, quranProgress: savedQuran, dhikrCount: savedDhikr } = JSON.parse(savedProgress);
      setPrayerProgress(savedPrayers || {});
      setQuranProgress(savedQuran || 0);
      setDhikrCount(savedDhikr || 0);
    }
  }, []);

  // Save to localStorage whenever progress changes
  useEffect(() => {
    const progressData = {
      prayerProgress,
      quranProgress,
      dhikrCount
    };
    localStorage.setItem('muslimDiary_progress', JSON.stringify(progressData));
  }, [prayerProgress, quranProgress, dhikrCount]);

  const markPracticeCompleted = (practiceType) => {
    if (practiceType.includes('prayer')) {
      setPrayerProgress(prev => ({
        ...prev,
        [practiceType]: true
      }));
    }
  };

  const markPracticeIncomplete = (practiceType) => {
    if (practiceType.includes('prayer')) {
      setPrayerProgress(prev => ({
        ...prev,
        [practiceType]: false
      }));
    }
  };

  const isPracticeCompleted = (practiceType) => {
    return prayerProgress[practiceType] || false;
  };

  const updateQuranProgress = (pages) => {
    setQuranProgress(prev => prev + pages);
  };

  const incrementDhikr = () => {
    setDhikrCount(prev => prev + 1);
  };

  // Calculate today's stats
  const todayStats = {
    prayersCompleted: Object.values(prayerProgress).filter(Boolean).length,
    progress: (Object.values(prayerProgress).filter(Boolean).length / 5) * 100,
    quranPages: quranProgress,
    dhikrCount: dhikrCount
  };

  const value = {
    prayerProgress,
    quranProgress,
    dhikrCount,
    todayStats,
    markPracticeCompleted,
    markPracticeIncomplete,
    isPracticeCompleted,
    updateQuranProgress,
    incrementDhikr
  };

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
};
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
  const [practices, setPractices] = useState({});
  const [streak, setStreak] = useState(0);
  const [todayStats, setTodayStats] = useState({
    prayersCompleted: 0,
    totalPrayers: 5,
    progress: 0
  });

  // Load practices from localStorage on app start
  useEffect(() => {
    const savedPractices = localStorage.getItem('muslimDaily_practices');
    const savedStreak = localStorage.getItem('muslimDaily_streak');
    
    if (savedPractices) {
      setPractices(JSON.parse(savedPractices));
    }
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    
    updateTodayStats();
  }, []);

  // Update today's stats whenever practices change
  useEffect(() => {
    updateTodayStats();
    saveToLocalStorage();
  }, [practices]);

  const updateTodayStats = () => {
    const today = new Date().toDateString();
    const todayPractices = practices[today] || {};
    const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    
    const prayersCompleted = prayerKeys.filter(key => todayPractices[key]).length;
    const progress = (prayersCompleted / 5) * 100;
    
    setTodayStats({
      prayersCompleted,
      totalPrayers: 5,
      progress
    });

    // Update streak
    updateStreak(todayPractices, today);
  };

  const updateStreak = (todayPractices, today) => {
    const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const todayCompleted = prayerKeys.filter(key => todayPractices[key]).length;
    
    if (todayCompleted === 5) {
      // Check if yesterday was also completed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toDateString();
      const yesterdayPractices = practices[yesterdayKey] || {};
      const yesterdayCompleted = prayerKeys.filter(key => yesterdayPractices[key]).length;
      
      if (yesterdayCompleted === 5) {
        setStreak(prev => prev + 1);
      } else {
        setStreak(1);
      }
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('muslimDaily_practices', JSON.stringify(practices));
    localStorage.setItem('muslimDaily_streak', streak.toString());
  };

  const markPracticeCompleted = (practiceType, timestamp = new Date()) => {
    const dateKey = timestamp.toDateString();
    
    setPractices(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [practiceType]: {
          completed: true,
          timestamp: timestamp.toISOString(),
          type: practiceType
        }
      }
    }));
  };

  const markPracticeIncomplete = (practiceType, timestamp = new Date()) => {
    const dateKey = timestamp.toDateString();
    
    setPractices(prev => {
      const updated = { ...prev };
      if (updated[dateKey] && updated[dateKey][practiceType]) {
        delete updated[dateKey][practiceType];
      }
      return updated;
    });
  };

  const isPracticeCompleted = (practiceType, date = new Date()) => {
    const dateKey = date.toDateString();
    return !!practices[dateKey]?.[practiceType]?.completed;
  };

  const getTodayPractices = () => {
    const today = new Date().toDateString();
    return practices[today] || {};
  };

  const getWeeklyProgress = () => {
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      const dayPractices = practices[dateKey] || {};
      const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
      const completed = prayerKeys.filter(key => dayPractices[key]).length;
      
      weekData.push({
        date: dateKey,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        total: 5
      });
    }
    
    return weekData;
  };

  const value = {
    practices,
    streak,
    todayStats,
    markPracticeCompleted,
    markPracticeIncomplete,
    isPracticeCompleted,
    getTodayPractices,
    getWeeklyProgress
  };

  return (
    <PracticeContext.Provider value={value}>
      {children}
    </PracticeContext.Provider>
  );
};
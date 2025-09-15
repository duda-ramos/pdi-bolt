import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureFlagContextType {
  useMockData: boolean;
  useFallback: boolean;
  toggleMockData: () => void;
  setUseFallback: (value: boolean) => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};

interface FeatureFlagProviderProps {
  children: ReactNode;
}

export const FeatureFlagProvider: React.FC<FeatureFlagProviderProps> = ({ children }) => {
  const [useMockData, setUseMockData] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const toggleMockData = () => {
    setUseMockData(prev => !prev);
    setUseFallback(false); // Reset fallback when manually toggling
  };

  const value: FeatureFlagContextType = {
    useMockData,
    useFallback,
    toggleMockData,
    setUseFallback,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
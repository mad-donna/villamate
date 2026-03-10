import React, { createContext, useContext, useState } from 'react';

type AppMode = 'ADMIN' | 'RESIDENT';

interface AppModeContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
}

const AppModeContext = createContext<AppModeContextType>({
  appMode: 'ADMIN',
  setAppMode: () => {},
});

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appMode, setAppMode] = useState<AppMode>('ADMIN');
  return (
    <AppModeContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => useContext(AppModeContext);

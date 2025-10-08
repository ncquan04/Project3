import { ReactNode } from 'react';
import AuthContextProvider from './AuthContext';

const AppProvider = ({ children }: { children: ReactNode }) => {
  return <AuthContextProvider>{children}</AuthContextProvider>;
};

export default AppProvider;

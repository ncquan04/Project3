import { createContext, useContext } from 'react';

const CommonAppContext = createContext<{}>({});

export const CommonAppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <CommonAppContext.Provider value={{}}>{children}</CommonAppContext.Provider>
  );
};

export const useCommonApp = () => useContext(CommonAppContext);

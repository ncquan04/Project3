import auth, {
  createUserWithEmailAndPassword,
  FirebaseAuthTypes,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from '@react-native-firebase/auth';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { navigationRef } from '../navigation';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, password: string) => Promise<void>;
  user: FirebaseAuthTypes.User | null;
}>({
  isAuthenticated: false,
  isLoading: true,
  login: (username: string, password: string) => Promise.resolve(),
  logout: () => {},
  register: (username: string, password: string) => Promise.resolve(),
  user: null,
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    setIsLoading(false);
  };

  useEffect(() => {
    const subsciber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subsciber;
  }, []);

  const login = async (username: string, password: string) => {
    await signInWithEmailAndPassword(getAuth(), username, password)
      .then(userCredential => {
        setUser(userCredential.user);
      })
      .then(() => {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch(error => {
        console.error('Login error: ', error);
      });
  };

  const logout = async () => {
    await signOut(getAuth())
      .then(() => setUser(null))
      .then(() => {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      })
      .catch(error => {
        console.error('Logout error: ', error);
      });
  };

  const register = async (username: string, password: string) => {
    await createUserWithEmailAndPassword(getAuth(), username, password)
      .then(userCredential => {
        setUser(userCredential.user);
      })
      .catch(error => {
        console.error('Register error: ', error);
      });
  };
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;

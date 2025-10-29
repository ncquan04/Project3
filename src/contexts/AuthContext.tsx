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
import { getFirestore } from '@react-native-firebase/firestore';
import { UserRole } from '../types';
import LoadingModal from '../components/loading/LoadingModal';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    password: string,
    role: UserRole,
  ) => Promise<void>;
  user: FirebaseAuthTypes.User | null;
  role: UserRole | null;
}>({
  isAuthenticated: false,
  isLoading: true,
  login: (
    username: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => Promise.resolve(),
  logout: () => {},
  register: (username: string, password: string) => Promise.resolve(),
  user: null,
  role: null,
});

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const handleAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (isLoading) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const subsciber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subsciber;
  }, []);

  const login = async (
    username: string,
    password: string,
    setError: React.Dispatch<React.SetStateAction<string>>,
  ) => {
    setIsLoading(true);
    await signInWithEmailAndPassword(getAuth(), username, password)
      .then(userCredential => {
        setUser(userCredential.user);
        return userCredential;
      })
      .then(async userCredential => {
        const res = await getFirestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .get();
        return res.data();
      })
      .then(userData => {
        setRole(userData?.role as UserRole);
      })
      .then(() => {
        setIsLoading(false);
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch(error => {
        console.error('Login error: ', error);
        setError('Invalid username or password');
        setIsLoading(false);
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

  const register = async (
    username: string,
    password: string,
    role: UserRole,
  ) => {
    setIsLoading(true);
    await createUserWithEmailAndPassword(getAuth(), username, password)
      .then(async userCredential => {
        setUser(userCredential.user);
        return userCredential;
      })
      .then(async userCredential => {
        await getFirestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .set({
            role: role,
          });
        return userCredential;
      })
      .then(async userCredential => {
        const res = await getFirestore()
          .collection('users')
          .doc(userCredential.user.uid)
          .get();
        return res.data();
      })
      .then(userData => {
        setRole(userData?.role as UserRole);
      })
      .then(() => {
        setIsLoading(false);
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch(error => {
        console.error('Register error: ', error);
        setIsLoading(false);
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
        role,
      }}
    >
      <LoadingModal visible={isLoading} />
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;

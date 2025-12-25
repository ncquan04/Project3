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
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from '@react-native-firebase/firestore';
import { Gender, Student, UserRole } from '../types';

const AuthContext = createContext<{
  isAuthenticated: boolean;
  isLoading: boolean;
  studentInfo: Student | null;
  teacherInfo: any | null;
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
  studentInfo: null,
  teacherInfo: null,
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
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<any | null>(null);

  const handleAuthStateChanged = async (
    user: FirebaseAuthTypes.User | null,
  ) => {
    setUser(user);

    if (user) {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        const userData = await getDoc(userRef);
        const data = userData.data();
        if ((data?.role as UserRole) === UserRole.Student) {
          setStudentInfo({
            studentId: data?.studentId || '',
            name: data?.name || '',
            email: data?.email || '',
            gender: data?.gender || Gender.Male,
            major: data?.major || '',
            role: UserRole.Student,
            year: data?.year || '',
          });
          setRole(UserRole.Student);
        } else if ((data?.role as UserRole) === UserRole.Teacher) {
          setTeacherInfo({
            teacherId: data?.teacherId || '',
            name: data?.name || '',
            email: data?.email || '',
            role: UserRole.Teacher,
          });
          setRole(UserRole.Teacher);
        }
      } catch (error) {
        console.error('Error fetching user role: ', error);
        setRole(null);
      }
    } else {
      setRole(null);
    }

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
        const db = getFirestore();
        const userRef = doc(db, 'users', userCredential.user.uid);
        const res = await getDoc(userRef);
        return res.data();
      })
      .then(userData => {
        setRole(userData?.role as UserRole);
        setIsLoading(false);
        // Navigation sẽ tự động chuyển khi isAuthenticated thay đổi
      })
      .catch(error => {
        console.error('Login error: ', error);
        setError('Invalid username or password');
        setIsLoading(false);
      });
  };

  const logout = async () => {
    await signOut(getAuth())
      .then(() => {
        setUser(null);
        setRole(null);
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
        const db = getFirestore();
        const userRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(userRef, {
          role: role,
        });
        return userCredential;
      })
      .then(async userCredential => {
        const db = getFirestore();
        const userRef = doc(db, 'users', userCredential.user.uid);
        const res = await getDoc(userRef);
        return res.data();
      })
      .then(userData => {
        setRole(userData?.role as UserRole);
        setIsLoading(false);
        // Navigation sẽ tự động chuyển khi isAuthenticated thay đổi
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
        studentInfo,
        teacherInfo,
        login,
        logout,
        register,
        user,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContextProvider;

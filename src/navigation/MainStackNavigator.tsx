import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import { HomeTabsNavigator } from './HomeTabsNavigator';
import LoginPage from '../tabs/Login/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import RegisterPage from '../tabs/Login/RegisterPage';

export type AppStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

const MainStack = createNativeStackNavigator<AppStackParamList>();

export const MainStackNavigator = () => {
  const { isAuthenticated } = useAuth();

  return (
    <MainStack.Navigator
      screenOptions={{
        navigationBarHidden: true,
        headerShown: false,
      }}
      initialRouteName={isAuthenticated ? 'Home' : 'Login'}
    >
      <MainStack.Screen name="Home" component={HomeTabsNavigator} />
      <MainStack.Screen name="Login" component={LoginPage} />
      <MainStack.Screen name="Register" component={RegisterPage} />
    </MainStack.Navigator>
  );
};

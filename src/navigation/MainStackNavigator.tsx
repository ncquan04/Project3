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
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MainStack.Navigator
      screenOptions={{
        navigationBarHidden: true,
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <MainStack.Screen name="Home" component={HomeTabsNavigator} />
      ) : (
        <>
          <MainStack.Screen name="Login" component={LoginPage} />
          <MainStack.Screen name="Register" component={RegisterPage} />
        </>
      )}
    </MainStack.Navigator>
  );
};

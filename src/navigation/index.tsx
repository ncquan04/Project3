import {
  createNavigationContainerRef,
  NavigationContainer,
} from '@react-navigation/native';
import { AppStackParamList, MainStackNavigator } from './MainStackNavigator';
import { HomeTabParamList } from './HomeTabsNavigator';

interface NavigationRef extends AppStackParamList, HomeTabParamList {}

export const navigationRef = createNavigationContainerRef<NavigationRef>();

export const RootNavigation = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <MainStackNavigator />
    </NavigationContainer>
  );
};

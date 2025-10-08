import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { THEME_COLOR } from '../constants';
import DashboardTab from '../tabs/Dashboard/DashboardTab';
import DashboardIcon from '../../icons/DashboardIcon';
import AttendanceTab from '../tabs/Attendance/AttendanceTab';
import CheckIconCircle from '../../icons/CheckIconCircle';

export type HomeTabParamList = {
  Dashboard: undefined;
  Attendance: undefined;
};

const Tab = createBottomTabNavigator<HomeTabParamList>();

export const HomeTabsNavigator = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: THEME_COLOR.primary,
          tabBarInactiveTintColor: THEME_COLOR.mediumGrey + 'aa',
          tabBarStyle: {
            height: 56,
            borderColor: THEME_COLOR.canvasGrey,
            borderWidth: 0.5,
            borderRadius: 16,
            bottom: 4,
            marginHorizontal: 8,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardTab}
          options={{
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <DashboardIcon width={size} height={size} fill={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Attendance"
          component={AttendanceTab}
          options={{
            tabBarLabel: 'Attendance',
            tabBarIcon: ({ color, size }) => (
              <CheckIconCircle width={size} height={size} fill={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

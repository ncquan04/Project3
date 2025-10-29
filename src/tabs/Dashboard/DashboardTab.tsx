import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NativeRTNAttendance from '../../../specs/NativeRTNAttendance';

const SERVICE_TYPE = '_rtn._tcp.';

const DashboardTab = () => {
  const { logout } = useAuth();

  return (
    <View>
      <TouchableOpacity
        onPress={logout}
        style={{ width: 64, height: 64, backgroundColor: 'red' }}
      />
      <TouchableOpacity
        onPress={() => {
          NativeRTNAttendance.startDiscovery(SERVICE_TYPE, 5000);
        }}
        style={{ width: 64, height: 64, backgroundColor: 'blue' }}
      />
    </View>
  );
};

export default DashboardTab;

import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardTab = () => {
  const { logout } = useAuth();

  return (
    <View>
      <TouchableOpacity
        onPress={logout}
        style={{ width: 64, height: 64, backgroundColor: 'red' }}
      />
    </View>
  );
};

export default DashboardTab;

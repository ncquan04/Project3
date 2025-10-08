import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLOR } from '../../constants';

interface CommonButtonProps {
  buttonText?: string;
  onPress?: () => void;
}

const CommonButton = (props: CommonButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        width: '100%',
        height: 48,
        borderRadius: 30,
        overflow: 'hidden',
      }}
      onPress={props.onPress}
    >
      <LinearGradient
        colors={[THEME_COLOR.primary, THEME_COLOR.primary + 'cc']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text
          style={{ color: THEME_COLOR.white, fontSize: 16, fontWeight: 'bold' }}
        >
          {props.buttonText ?? 'Continue'}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CommonButton;

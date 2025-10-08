import { View, Text, TextInput } from 'react-native';
import React, { Dispatch, SetStateAction } from 'react';
import { THEME_COLOR } from '../../../constants';

interface LoginAreaProps {
  username: string;
  password: string;
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
}

const LoginArea = (props: LoginAreaProps) => {
  return (
    <View style={{ width: '100%', gap: 8, alignItems: 'center' }}>
      <View style={{ width: '100%', alignItems: 'flex-start', gap: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'semibold',
            color: THEME_COLOR.mediumGrey,
          }}
        >
          Username or Email
        </Text>
        <TextInput
          placeholder="Enter your username or email"
          placeholderTextColor={THEME_COLOR.mediumGrey + 'cc'}
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: THEME_COLOR.mediumGrey,
            borderRadius: 8,
            color: THEME_COLOR.black,
          }}
          onChangeText={text => props.setUsername(text)}
        >
          {props.username}
        </TextInput>
      </View>
      <View style={{ width: '100%', alignItems: 'flex-start', gap: 8 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'semibold',
            color: THEME_COLOR.mediumGrey,
          }}
        >
          Password
        </Text>
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor={THEME_COLOR.mediumGrey + 'cc'}
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: THEME_COLOR.mediumGrey,
            borderRadius: 8,
            color: THEME_COLOR.black,
          }}
          onChangeText={text => props.setPassword(text)}
        >
          {props.password}
        </TextInput>
      </View>
    </View>
  );
};

export default LoginArea;

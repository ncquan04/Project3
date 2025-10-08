import { View, Text, TextInput } from 'react-native';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { THEME_COLOR } from '../../../constants';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface LoginAreaProps {
  username: string;
  password: string;
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword?: string;
  setConfirmPassword?: Dispatch<SetStateAction<string>>;
  error?: string;
  setError?: Dispatch<SetStateAction<string>>;
}

const LoginArea = (props: LoginAreaProps) => {
  useEffect(() => {
    if (
      props.password !== '' &&
      props.confirmPassword !== props.password &&
      props.setError !== undefined
    ) {
      if (props.password !== props.confirmPassword) {
        props.setError('Passwords do not match');
      }
    } else {
      props.setError && props.setError('');
    }
  }, [props.confirmPassword]);

  return (
    <View style={{ width: '100%' }}>
      <View style={{ height: 32 }}>
        {props.error && (
          <Animated.Text
            style={{
              fontSize: 14,
              fontWeight: 'semibold',
              color: THEME_COLOR.crimsonRed,
            }}
            // entering={FadeIn.duration(200)}
            // exiting={FadeOut.duration(200)}
          >
            {props.error}
          </Animated.Text>
        )}
      </View>
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
        {props.confirmPassword !== undefined &&
          props.setConfirmPassword !== undefined && (
            <View style={{ width: '100%', alignItems: 'flex-start', gap: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'semibold',
                  color: THEME_COLOR.mediumGrey,
                }}
              >
                Confirm Password
              </Text>
              <TextInput
                placeholder="Re-enter your password"
                placeholderTextColor={THEME_COLOR.mediumGrey + 'cc'}
                style={{
                  width: '100%',
                  borderWidth: 1,
                  borderColor: THEME_COLOR.mediumGrey,
                  borderRadius: 8,
                  color: THEME_COLOR.black,
                }}
                onChangeText={text => props.setConfirmPassword!(text)}
              >
                {props.confirmPassword}
              </TextInput>
            </View>
          )}
      </View>
    </View>
  );
};

export default LoginArea;

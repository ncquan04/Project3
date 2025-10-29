import { View, Text, TextInput, ScrollView } from 'react-native';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import Animated from 'react-native-reanimated';
import { UserRole } from '../../../types';
import { THEME_COLOR } from '../../../theme';
import AppText from '../../../components/appText/AppText';

interface LoginAreaProps {
  username: string;
  password: string;
  setUsername: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword?: string;
  setConfirmPassword?: Dispatch<SetStateAction<string>>;
  error?: string;
  setError?: Dispatch<SetStateAction<string>>;
  chooseRole?: boolean;
  role?: UserRole;
  setRole?: Dispatch<SetStateAction<UserRole>>;
}

const LoginArea = (props: LoginAreaProps) => {
  const roles: UserRole[] = [UserRole.Student, UserRole.Teacher];
  const scrollViewRef = useRef<ScrollView>(null);
  const ITEM_HEIGHT = 50;

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

  useEffect(() => {
    if (props.chooseRole && scrollViewRef.current) {
      // Scroll to selected item on mount
      setTimeout(() => {
        const selectedIndex = roles.indexOf(props.role || UserRole.Student);
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: true,
        });
      }, 300);
    }
  }, []);

  const handleMomentumScrollEnd = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (props.setRole && roles[index]) {
      props.setRole(roles[index]);
    }
  };

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
          <AppText
            style={{
              fontSize: 14,
              fontWeight: 'semibold',
              color: THEME_COLOR.mediumGrey,
            }}
          >
            Username or Email
          </AppText>
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
          <AppText
            style={{
              fontSize: 14,
              fontWeight: 'semibold',
              color: THEME_COLOR.mediumGrey,
            }}
          >
            Password
          </AppText>
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
              <AppText
                style={{
                  fontSize: 14,
                  fontWeight: 'semibold',
                  color: THEME_COLOR.mediumGrey,
                }}
              >
                Confirm Password
              </AppText>
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
        {props.chooseRole && (
          <View style={{ width: '100%', alignItems: 'flex-start', gap: 8 }}>
            <AppText
              style={{
                fontSize: 14,
                fontWeight: 'semibold',
                color: THEME_COLOR.mediumGrey,
              }}
            >
              Choose Role
            </AppText>
            <View
              style={{
                height: ITEM_HEIGHT * 3,
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Selection indicator - thanh highlight ở giữa */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: ITEM_HEIGHT,
                  left: 0,
                  right: 0,
                  height: ITEM_HEIGHT,
                  borderTopWidth: 2,
                  borderBottomWidth: 2,
                  borderColor: THEME_COLOR.primary + '60',
                  backgroundColor: '#eeeeeeaa',
                  zIndex: 1,
                  borderRadius: 8,
                }}
              />
              <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT }}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                style={{ zIndex: 5 }}
              >
                {roles.map((roleOption, index) => {
                  const selectedIndex = roles.indexOf(
                    props.role || UserRole.Student,
                  );
                  const isSelected = selectedIndex === index;

                  return (
                    <View
                      key={roleOption}
                      style={{
                        height: ITEM_HEIGHT,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                        opacity: isSelected ? 1 : 0.5,
                      }}
                    >
                      <AppText
                        style={{
                          fontSize: isSelected ? 20 : 16,
                          fontWeight: 'bold',
                          color: THEME_COLOR.primary,
                        }}
                      >
                        {roleOption === UserRole.Student
                          ? 'Student'
                          : 'Teacher'}
                      </AppText>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default LoginArea;

import { View, Text, StatusBar, Image } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import LoginHeader from './components/LoginHeader';
import LoginArea from './components/LoginArea';
import CommonButton from '../../components/common/CommonButton';
import { useAuth } from '../../contexts/AuthContext';
import { THEME_COLOR } from '../../theme';
import AppText from '../../components/appText/AppText';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useAuth();

  return (
    <LinearGradient
      colors={[THEME_COLOR.primary, THEME_COLOR.primary + 'aa']}
      style={{
        flex: 1,
        width: '100%',
        paddingTop: StatusBar.currentHeight,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          alignItems: 'center',
        }}
      >
        <Image
          source={require('../../../assets/images/HUST.png')}
          style={{ width: 32, maxHeight: 64 }}
          resizeMode="contain"
        />
        <AppText
          style={{ fontSize: 16, fontWeight: 'bold', color: THEME_COLOR.white }}
        >
          HUST
        </AppText>
      </View>
      <View
        style={{
          width: '90%',
          marginTop: 16,
          backgroundColor: THEME_COLOR.white,
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 16,
          alignItems: 'center',
          gap: 24,
        }}
      >
        <LoginHeader />
        <LoginArea
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          error={error}
          setError={setError}
        />
        <CommonButton
          onPress={() => login(username, password, setError)}
          buttonText="Login"
        />
      </View>
    </LinearGradient>
  );
};

export default LoginPage;

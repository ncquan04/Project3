import { View, Text, StatusBar, Image } from 'react-native';
import React, { useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { THEME_COLOR } from '../../constants';
import CommonButton from '../../components/common/CommonButton';
import { useAuth } from '../../contexts/AuthContext';
import LoginArea from './components/LoginArea';
import SignupHeader from './components/SignupHeader';
import { UserRole } from '../../types';

const RegisterPage = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    await register(username, password, role).catch(err => {
      setError(err.message);
    });
  };

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
        <Text
          style={{ fontSize: 16, fontWeight: 'bold', color: THEME_COLOR.white }}
        >
          HUST
        </Text>
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
        <SignupHeader />
        <LoginArea
          username={username}
          password={password}
          setUsername={setUsername}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          setError={setError}
          chooseRole={true}
          role={role}
          setRole={setRole}
        />
        <CommonButton
          onPress={async () => await handleRegister()}
          buttonText="Register"
        />
      </View>
    </LinearGradient>
  );
};

export default RegisterPage;

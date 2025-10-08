import { Text, View } from 'react-native';
import { THEME_COLOR } from '../../../constants';

const LoginHeader = () => {
  return (
    <View style={{ gap: 8, alignItems: 'center' }}>
      <Text
        style={{ fontSize: 24, fontWeight: 'bold', color: THEME_COLOR.black }}
      >
        Login
      </Text>
      <Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            color: THEME_COLOR.black,
          }}
        >
          {`Does not have an account? `}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            textDecorationLine: 'underline',
            color: THEME_COLOR.primaryBlue,
          }}
        >
          Sign up
        </Text>
      </Text>
    </View>
  );
};

export default LoginHeader;

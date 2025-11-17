import { View } from 'react-native';
import UserIcon from '../../icons/UserIcon';
import AppText from '../appText/AppText';
import { useAuth } from '../../contexts/AuthContext';
import { THEME_COLOR } from '../../theme';

const UserInfoCard = () => {
  const { user } = useAuth();

  return (
    <View
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <UserIcon width={64} height={64} />
      <View style={{ flexDirection: 'column', gap: 4 }}>
        <AppText
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            color: THEME_COLOR.black,
          }}
        >
          {user?.displayName}
        </AppText>
        <AppText style={{ fontSize: 14, color: THEME_COLOR.black }}>
          20225385
        </AppText>
      </View>
    </View>
  );
};

export default UserInfoCard;

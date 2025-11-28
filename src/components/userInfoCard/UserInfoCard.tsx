import { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import UserIcon from '../../icons/UserIcon';
import AppText from '../appText/AppText';
import { useAuth } from '../../contexts/AuthContext';
import { THEME_COLOR } from '../../theme';
import LogoutIcon from '../../icons/LogoutIcon';

const UserInfoCard = () => {
  const { user, logout } = useAuth();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const drawerWidth = useMemo(
    () => Math.min(Dimensions.get('window').width * 0.75, 320),
    [],
  );
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const overlayOpacity = useMemo(
    () =>
      slideAnim.interpolate({
        inputRange: [-drawerWidth, 0],
        outputRange: [0, 0.4],
        extrapolate: 'clamp',
      }),
    [drawerWidth, slideAnim],
  );

  const animateDrawer = (toValue: number, onEnd?: () => void) => {
    Animated.timing(slideAnim, {
      toValue,
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && onEnd) {
        onEnd();
      }
    });
  };

  const openDrawer = () => {
    setIsDrawerVisible(true);
    animateDrawer(0);
  };

  const closeDrawer = () => {
    animateDrawer(-drawerWidth, () => setIsDrawerVisible(false));
  };

  const handleLogout = async () => {
    await logout();
    closeDrawer();
  };

  return (
    <>
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <TouchableOpacity onPress={openDrawer} activeOpacity={0.8}>
          <UserIcon width={64} height={64} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'column', gap: 4 }}>
          <AppText
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: THEME_COLOR.black,
            }}
          >
            {user?.displayName || 'Người dùng'}
          </AppText>
          <AppText style={{ fontSize: 14, color: THEME_COLOR.black }}>
            {user?.email || '—'}
          </AppText>
        </View>
      </View>

      <Modal
        transparent
        visible={isDrawerVisible}
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeDrawer}
      >
        <View style={{ flex: 1 }}>
          <Pressable
            onPress={closeDrawer}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <Animated.View
              pointerEvents="none"
              style={{
                flex: 1,
                backgroundColor: THEME_COLOR.black,
                opacity: overlayOpacity,
              }}
            />
          </Pressable>

          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: drawerWidth,
              backgroundColor: THEME_COLOR.white,
              paddingHorizontal: 24,
              paddingVertical: 48,
              justifyContent: 'space-between',
              shadowColor: THEME_COLOR.black,
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <View style={{ gap: 12 }}>
              <UserIcon width={80} height={80} />
              <AppText
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: THEME_COLOR.black,
                }}
              >
                {user?.displayName || 'Người dùng'}
              </AppText>
              <AppText style={{ fontSize: 15, color: THEME_COLOR.grey }}>
                {user?.email || 'Chưa cập nhật email'}
              </AppText>
              {user?.uid ? (
                <AppText
                  style={{ fontSize: 13, color: THEME_COLOR.mediumGrey }}
                >
                  ID: {user.uid}
                </AppText>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleLogout}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingVertical: 14,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: THEME_COLOR.lightGrey,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <LogoutIcon width={22} height={22} fill={THEME_COLOR.black} />
              </View>
              <AppText
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: THEME_COLOR.black,
                }}
              >
                Đăng xuất
              </AppText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

export default UserInfoCard;

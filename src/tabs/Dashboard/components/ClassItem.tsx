import { View, Linking, Alert } from 'react-native';
import { Class } from '../../../types';
import { THEME_COLOR } from '../../../theme';
import AppText from '../../../components/appText/AppText';

const ClassItem = ({ cls }: { cls: Class }) => {
  return (
    <View
      style={{
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: THEME_COLOR.white,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 16,
      }}
    >
      <View style={{ alignItems: 'center', gap: 4 }}>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'semibold',
            color: THEME_COLOR.black,
          }}
        >
          {cls.schedule.startTime}
        </AppText>
        <View
          style={{
            width: 1,
            height: 16,
            backgroundColor: THEME_COLOR.mediumGrey,
          }}
        />
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'semibold',
            color: THEME_COLOR.black,
          }}
        >
          {cls.schedule.endTime}
        </AppText>
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <AppText
          style={{ fontSize: 16, fontWeight: 'bold', color: THEME_COLOR.black }}
        >
          {cls.subjectCode} - <AppText>{cls.subjectName}</AppText>
        </AppText>
        <AppText style={{ fontSize: 14, fontWeight: 'medium' }}>
          {cls.teacher.name}
        </AppText>
        <AppText
          style={{
            fontSize: 14,
            fontWeight: 'medium',
            color: '#1e73afff',
            textDecorationLine: 'underline',
          }}
          onPress={async () => {
            const email = cls.teacher.email?.trim();
            if (!email) return;
            const url = `mailto:${encodeURIComponent(email)}`;
            await Linking.openURL(url);
          }}
        >
          {cls.teacher.email}
        </AppText>
      </View>
    </View>
  );
};

export default ClassItem;

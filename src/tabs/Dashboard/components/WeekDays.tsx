import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { THEME_COLOR } from '../../../theme';
import AppText from '../../../components/appText/AppText';

interface WeekDaysProps {
  day: Date;
  setDay: Dispatch<SetStateAction<Date>>;
}

const WeekDays = (props: WeekDaysProps) => {
  const ITEM_SIZE = 64 + 12;

  const flatListRef = useRef<FlatList<Date>>(null);

  const today = new Date();
  const startOfWeek = useMemo(() => {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [today]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  }, [startOfWeek]);

  const renderDay = ({ item }: { item: Date }) => {
    const isSelected = item.toDateString() === props.day.toDateString();
    return (
      <TouchableOpacity
        style={{
          width: 64,
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: isSelected
            ? THEME_COLOR.primary
            : THEME_COLOR.veryLightGrey,
          backgroundColor: isSelected ? THEME_COLOR.primary : THEME_COLOR.white,
          elevation: 1,
        }}
        onPress={() => props.setDay(item)}
      >
        <AppText
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: isSelected ? THEME_COLOR.white : THEME_COLOR.black,
          }}
        >
          {item.getDate()}
        </AppText>
        <AppText
          style={{
            fontSize: 12,
            color: isSelected ? THEME_COLOR.white : THEME_COLOR.black,
          }}
        >
          {item.toLocaleDateString('en-US', { weekday: 'short' })}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ width: '100%', overflow: 'hidden' }}>
      <FlatList
        ref={flatListRef}
        data={weekDays}
        renderItem={renderDay}
        keyExtractor={(item: Date) => item.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        getItemLayout={(_, index) => ({
          length: ITEM_SIZE,
          offset: ITEM_SIZE * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          flatListRef.current?.scrollToOffset({
            offset: ITEM_SIZE * info.index,
            animated: true,
          });
        }}
        style={{ width: '100%' }}
        contentContainerStyle={{ height: ITEM_SIZE }}
      />
    </View>
  );
};

export default WeekDays;

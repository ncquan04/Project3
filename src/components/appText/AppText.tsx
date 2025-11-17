import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { THEME_COLOR } from '../../theme';

const AppFont: Record<string, string> = {
  normal: 'Regular',
  bold: 'Bold',
  medium: 'Medium',
  black: 'Black',
  '100': 'Light',
  '200': 'ExtraLight',
  '300': 'Regular',
  '400': 'Regular',
  '500': 'Medium',
  '600': 'SemiBold',
  '700': 'Bold',
  '800': 'ExtraBold',
  '900': 'Black',
};

const disableStyles: StyleProp<TextStyle> = {
  fontStyle: 'normal',
  fontWeight: 'normal',
};

type TextProps = Text['props'];

export default function AppText(props: TextProps) {
  const {
    fontWeight = '400',
    fontStyle,
    color,
  } = StyleSheet.flatten(props.style || {});

  const fontFamily = `Nunito-${AppFont[fontWeight]}${
    fontStyle === 'italic' ? 'Italic' : ''
  }`;

  const textColor = color ? color : THEME_COLOR.black;

  return (
    <Text
      allowFontScaling={false}
      {...props}
      style={[props.style, { fontFamily }, { color: textColor }]}
    />
  );
}

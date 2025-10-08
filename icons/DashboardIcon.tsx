import * as React from 'react';
import Svg, { Defs, ClipPath, Path, G, SvgProps } from 'react-native-svg';

function DashboardIcon(props: SvgProps) {
  return (
    <Svg
      //   xmlns="http://www.w3.org/2000/svg"
      width={512}
      height={512}
      viewBox="0 0 682.667 682.667"
      //   enableBackground="new 0 0 512 512"
      {...props}
    >
      <Defs>
        <ClipPath id="a">
          <Path d="M0 512h512V0H0z" data-original="#000000" />
        </ClipPath>
      </Defs>
      <G
        clipPath="url(#a)"
        transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
        fill="none"
        stroke="#000"
        strokeWidth={20}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
      >
        <Path
          d="M502 454.559c0 12.76-10.344 23.104-23.104 23.104H33.104c-12.76 0-23.104-10.344-23.104-23.104v-50.972h492zM10 403.587V57.441c0-12.759 10.344-23.103 23.104-23.103h445.792c12.76 0 23.104 10.344 23.104 23.103v346.146zM52.773 439.7h0M90.937 439.7h0M130.156 439.7h0"
          data-original="#000000"
          strokeWidth={20}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          strokeDasharray="none"
          strokeOpacity={1}
        />
        <Path
          d="M444.74 278.698c0-18.5-7.5-35.26-19.63-47.38-12.13-12.13-28.88-19.63-47.38-19.63-37.01 0-67.01 30-67.01 67.01 0 18.5 7.5 35.25 19.63 47.38 12.12 12.12 28.869 19.62 47.38 19.62 18.5 0 35.25-7.5 47.38-19.62 12.13-12.13 19.63-28.88 19.63-47.38z"
          data-original="#000000"
          strokeWidth={20}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          strokeDasharray="none"
          strokeOpacity={1}
        />
        <Path
          d="M444.74 278.698c0-18.5-7.5-35.26-19.63-47.38l-47.38 47.38v67c18.5 0 35.25-7.5 47.38-19.62 12.13-12.13 19.63-28.88 19.63-47.38zM310.72 154.63h134.02M128.716 154.631H79.149v93.877h49.567zm95.105 0h-49.566v157.762h49.566zM61 154.63h186M107.376 98.339H444.74M61 98.339h0"
          data-original="#000000"
          strokeWidth={20}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          strokeDasharray="none"
          strokeOpacity={1}
        />
      </G>
    </Svg>
  );
}

export default DashboardIcon;

import * as React from 'react';
import Svg, {
  Defs,
  ClipPath,
  Path,
  Mask,
  Rect,
  G,
  SvgProps,
} from 'react-native-svg';

function CheckIconCircle(props: SvgProps) {
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
        <ClipPath id="b">
          <Path d="M0 512h512V0H0z" data-original="#000000" />
        </ClipPath>
      </Defs>
      <Mask id="a">
        <Rect width="100%" height="100%" fill="#fff" data-original="#ffffff" />
      </Mask>
      <G mask="url(#a)">
        <Path
          d="M473.365 251.884L294.467 430.782l-85.164-85.162"
          fill="none"
          stroke="#000"
          strokeWidth={40}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          data-original="#000000"
          strokeDasharray="none"
          strokeOpacity={1}
        />
        <G
          clipPath="url(#b)"
          transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
        >
          <Path
            d="M492 256c0-130.339-105.661-236-236-236S20 125.661 20 256s105.661 236 236 236 236-105.661 236-236z"
            fill="none"
            stroke="#000"
            strokeWidth={40}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            data-original="#000000"
            strokeDasharray="none"
            strokeOpacity={1}
          />
        </G>
      </G>
    </Svg>
  );
}

export default CheckIconCircle;

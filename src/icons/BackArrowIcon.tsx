import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

function BackArrowIcon(props: SvgProps) {
  return (
    <Svg
      //   xmlns="http://www.w3.org/2000/svg"
      width={512}
      height={512}
      viewBox="0 0 24 24"
      //   enableBackground="new 0 0 512 512"
      {...props}
    >
      <Path
        d="M22 11H4.414l5.293-5.293a1 1 0 10-1.414-1.414l-7 7a1 1 0 000 1.414l7 7a1 1 0 001.414-1.414L4.414 13H22a1 1 0 000-2z"
        data-original="#000000"
      />
    </Svg>
  );
}

export default BackArrowIcon;

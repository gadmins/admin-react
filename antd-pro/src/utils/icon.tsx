import React from 'react';
import { HomeOutlined } from '@ant-design/icons';

export function string2Icon(icon: string) {
  let iconCP = <span />;
  switch (icon) {
    case 'home':
      iconCP = <HomeOutlined />;
      break;
    default:
      break;
  }
  return iconCP;
}

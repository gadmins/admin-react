import React from 'react';
import { HomeOutlined, UserOutlined, ProfileOutlined, DatabaseOutlined } from '@ant-design/icons';

export function string2Icon(icon: string) {
  let iconCP;
  switch (icon) {
    case 'home':
      iconCP = <HomeOutlined />;
      break;
    case 'user':
      iconCP = <UserOutlined />;
      break;
    case 'profile':
      iconCP = <ProfileOutlined />;
      break;
    case 'database':
      iconCP = <DatabaseOutlined />;
      break;
    default:
      iconCP = icon;
      break;
  }
  return iconCP;
}

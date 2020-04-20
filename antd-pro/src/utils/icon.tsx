import React from 'react';
import {
  HomeOutlined,
  UserOutlined,
  ProfileOutlined,
  DatabaseOutlined,
  TableOutlined,
  ProjectOutlined,
  ShopOutlined,
  ApiOutlined,
  MailOutlined,
  MessageOutlined,
  SettingOutlined,
  ToolOutlined,
  CloudOutlined,
} from '@ant-design/icons';

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
    case 'table':
      iconCP = <TableOutlined />;
      break;
    case 'project':
      iconCP = <ProjectOutlined />;
      break;
    case 'shop':
      iconCP = <ShopOutlined />;
      break;
    case 'api':
      iconCP = <ApiOutlined />;
      break;
    case 'mail':
      iconCP = <MailOutlined />;
      break;
    case 'message':
      iconCP = <MessageOutlined />;
      break;
    case 'setting':
      iconCP = <SettingOutlined />;
      break;
    case 'tool':
      iconCP = <ToolOutlined />;
      break;
    case 'cloud':
      iconCP = <CloudOutlined />;
      break;
    default:
      iconCP = icon;
      break;
  }
  return iconCP;
}

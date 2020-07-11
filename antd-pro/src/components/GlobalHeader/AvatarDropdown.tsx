import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Menu, Spin } from 'antd';
import React from 'react';
import { history, useModel } from 'umi';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';

export default ({ menu = false }) => {
  const { currentAccount = {} } = useModel('@@initialState', (c) => ({
    currentAccount: c.initialState?.currentAccount,
  }));
  const { logout } = useModel('account');
  const onMenuClick = (event: any) => {
    const { key } = event;

    if (key === 'logout') {
      logout();
    } else if (key === 'settings') {
      history.push(`/system/accountsettings`);
    }
  };
  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {menu && (
        <Menu.Item key="center">
          <UserOutlined />
          个人中心
        </Menu.Item>
      )}
      <Menu.Item key="settings">
        <SettingOutlined />
        账户设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">
        <LogoutOutlined />
        退出登录
      </Menu.Item>
    </Menu>
  );
  return currentAccount && currentAccount.name ? (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar
          size="small"
          className={styles.avatar}
          src={
            currentAccount.avatar ||
            'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
          }
          alt="avatar"
        />
        <span className={`${styles.name} anticon`}>{currentAccount.name}</span>
      </span>
    </HeaderDropdown>
  ) : (
    <Spin
      size="small"
      style={{
        marginLeft: 8,
        marginRight: 8,
      }}
    />
  );
};

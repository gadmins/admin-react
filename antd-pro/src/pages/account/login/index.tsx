import { Checkbox } from 'antd';
import React, { useState } from 'react';
import { LoginParamsType } from '@/services/account';
import MD5 from 'crypto-js/md5';
import { useModel } from 'umi';
import LoginFrom from './components/Login';

import styles from './style.less';

const { Tab, UserName, Password, Submit } = LoginFrom;
interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [autoLogin, setAutoLogin] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<string>('account');
  const { login } = useModel('account');
  const { refresh } = useModel('@@initialState');

  const handleSubmit = async (values: LoginParamsType) => {
    setSubmitting(true);
    const params = { ...values };
    params.password = MD5(values.password).toString();
    login({ ...params, type }, async () => {
      await refresh();
    });
  };
  return (
    <div className={styles.main}>
      <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
        <Tab key="account" tab="账户密码登录">
          <UserName
            name="userName"
            placeholder="用户名"
            rules={[
              {
                required: true,
                message: '请输入用户名!',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="密码"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </Tab>
        <div>
          <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
            自动登录
          </Checkbox>
          {/* <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a> */}
        </div>
        <Submit loading={submitting}>登录</Submit>
      </LoginFrom>
    </div>
  );
};

export default Login;

import React, { ReactNode } from 'react';
import { Redirect } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import { stringify } from 'querystring';
import Cookies from 'js-cookie';

interface SecurityLayoutProps {
  children?: ReactNode;
}

const SecurityLayout: React.FC<SecurityLayoutProps> = ({ children }) => {
  const token = Cookies.get('Admin-Token');
  const isLogin = token !== undefined;
  const queryString = stringify({
    redirect: window.location.href,
  });

  if (!isLogin) {
    return <PageLoading />;
  }
  if (!isLogin && window.location.pathname !== '/account/login') {
    return <Redirect to={`/account/login?${queryString}`} />;
  }
  return children;
};

export default SecurityLayout;

import React, { ReactNode } from 'react';
import { Redirect } from 'umi';
import { PageLoading } from '@ant-design/pro-layout';
import { stringify } from 'querystring';
import { isLogin, loginPath } from '@/utils/account.utils';

interface SecurityLayoutProps {
  children?: ReactNode;
}

const SecurityLayout: React.FC<SecurityLayoutProps> = ({ children }) => {
  const hasLogin = isLogin();
  const queryString = stringify({
    redirect: window.location.href,
  });

  if (!hasLogin) {
    return <PageLoading />;
  }
  if (!hasLogin && window.location.pathname !== loginPath) {
    return <Redirect to={`${loginPath}?${queryString}`} />;
  }
  return children;
};

export default SecurityLayout;

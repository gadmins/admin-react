import React from 'react';
import { Redirect } from 'umi';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import { getRouteAuthority } from '@/utils/utils';
import { ConnectProps, ConnectState, AccountModelState } from '@/models/connect';
import Cookies from 'js-cookie';

interface AuthComponentProps extends ConnectProps {
  account: AccountModelState;
}

const AuthComponent: React.FC<AuthComponentProps> = ({
  children,
  route = {
    routes: [],
  },
  location = {
    pathname: '',
  },
  account,
}) => {
  const { currentAccount } = account;
  const { routes = [] } = route;
  const isLogin = currentAccount && currentAccount.name && Cookies.get('Admin-Token') !== undefined;
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={isLogin ? <Redirect to="/exception/403" /> : <Redirect to="/account/login" />}
    >
      {children}
    </Authorized>
  );
};

export default connect(({ account }: ConnectState) => ({
  account,
}))(AuthComponent);

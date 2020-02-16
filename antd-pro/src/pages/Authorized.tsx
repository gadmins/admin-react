import React from 'react';
import { Redirect } from 'umi';
import { connect } from 'dva';
import Authorized from '@/utils/Authorized';
import { getRouteAuthority } from '@/utils/utils';
import { ConnectProps, ConnectState, AccoutModelState } from '@/models/connect';

interface AuthComponentProps extends ConnectProps {
  accout: AccoutModelState;
}

const AuthComponent: React.FC<AuthComponentProps> = ({
  children,
  route = {
    routes: [],
  },
  location = {
    pathname: '',
  },
  accout,
}) => {
  const { currentAccout } = accout;
  const { routes = [] } = route;
  const isLogin = currentAccout && currentAccout.name;
  return (
    <Authorized
      authority={getRouteAuthority(location.pathname, routes) || ''}
      noMatch={isLogin ? <Redirect to="/exception/403" /> : <Redirect to="/accout/login" />}
    >
      {children}
    </Authorized>
  );
};

export default connect(({ accout }: ConnectState) => ({
  accout,
}))(AuthComponent);

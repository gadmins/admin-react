import React, { ReactNode } from 'react';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';

interface AuthorizedBtnProps {
  code: string;
  authFuncs: any[];
  children?: ReactNode;
}

const AuthorizedBtn: React.FC<AuthorizedBtnProps> = (props) => {
  const { children, code, authFuncs } = props;
  return authFuncs.some((i: any) => i.code === code) ? <>{children}</> : <></>;
};

export default connect(({ account }: ConnectState) => ({
  authFuncs: account.authFuncs,
}))(AuthorizedBtn);

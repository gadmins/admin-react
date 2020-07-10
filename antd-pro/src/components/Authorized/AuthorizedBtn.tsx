import React, { ReactNode } from 'react';
import { useModel } from 'umi';

interface AuthorizedBtnProps {
  code: string;
  authFuncs: any[];
  children?: ReactNode;
}

const AuthorizedBtn: React.FC<AuthorizedBtnProps> = ({ code, children }) => {
  const { initialState } = useModel('@@initialState');
  const authFuncs = initialState?.menuData?.authFuncs || [];
  return authFuncs.some((i: any) => i.code === code) ? <>{children}</> : <></>;
};

export default AuthorizedBtn;

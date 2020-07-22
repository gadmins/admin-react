/* eslint-disable consistent-return */
import { MenuDataItem } from '@ant-design/pro-layout';
import { message } from 'antd';
import { requestLogin, LoginParamsType, requestLogout } from '@/services/account';
import { getPageQuery } from '@/utils/utils';
import { history } from 'umi';
import { stringify } from 'qs';
import { clearToken, LOGIN_PATH } from '@/utils/account.utils';

export interface AccountInfo {
  name?: string;
  avatar?: string;
}

export interface MenuData {
  menus: MenuDataItem[];
  authFuncs: any[];
  defTex: Map<string, string>;
}

export default () => {
  const login = async (param: LoginParamsType) => {
    const response = await requestLogin(param);
    // Login successfully
    if (response.code === 0) {
      message.success('登录成功');
      const urlParams = new URL(window.location.href);
      const params = getPageQuery();
      let { redirect } = params as { redirect: string };
      if (redirect) {
        const redirectUrlParams = new URL(redirect);
        if (redirectUrlParams.origin === urlParams.origin) {
          redirect = redirect.substr(urlParams.origin.length);
          if (redirect.match(/^\/.*#/)) {
            redirect = redirect.substr(redirect.indexOf('#') + 1);
          }
        } else {
          window.location.href = '/';
          return;
        }
      }
      history.replace(redirect || '/');
      window.location.reload();
    }
    return response.code === 0;
  };

  const logout = async () => {
    await requestLogout();
    clearToken();
    const { redirect } = getPageQuery();
    // Note: There may be security issues, please note
    if (window.location.pathname !== LOGIN_PATH && !redirect) {
      history.replace({
        pathname: LOGIN_PATH,
        search: stringify({
          redirect: window.location.href,
        }),
      });
    }
  };
  return {
    login,
    logout,
  };
};

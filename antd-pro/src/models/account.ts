import { MenuDataItem } from '@ant-design/pro-layout';
import { message } from 'antd';
import { requestLogin, LoginParamsType, requestLogout } from '@/services/account';
import { getPageQuery } from '@/utils/utils';
import { history } from 'umi';
import Cookies from 'js-cookie';
import { stringify } from 'qs';

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
  const login = async (param: LoginParamsType, success: () => void) => {
    const response = await requestLogin(param);
    // Login successfully
    if (response.code === 0) {
      await success();
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
    }
  };

  const logout = async () => {
    await requestLogout();
    Cookies.remove('Admin-Token');
    const { redirect } = getPageQuery();
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/account/login' && !redirect) {
      history.replace({
        pathname: '/account/login',
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

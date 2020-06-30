import { Reducer } from 'redux';
import { stringify } from 'querystring';
import { history, Effect } from 'umi';

import { fakeAccountLogin, fakeAccountLogout, getFakeCaptcha } from '@/services/login';
// import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import Cookies from 'js-cookie';

import { message } from 'antd';

export interface LoginModelState {
  status?: 'ok' | 'error';
  type?: string;
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface LoginModelType {
  state: LoginModelState;
  effects: {
    login: Effect;
    getCaptcha: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<LoginModelState>;
  };
}

const Model: LoginModelType = {
  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(fakeAccountLogin, payload);
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
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
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { call }) {
      yield call(fakeAccountLogout);
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
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      // setAuthority(payload.currentAuthority || ['admin']);
      return {
        ...state,
        status: payload.status || 'ok',
        type: payload.type,
      };
    },
  },
};

export default Model;

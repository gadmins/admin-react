import { Effect } from 'umi';
import { Reducer } from 'redux';
import Cookies from 'js-cookie';

import { queryCurrent, queryMenu } from '@/services/account';
import { MenuDataItem } from '@ant-design/pro-layout';
import { message } from 'antd';

export interface CurrentAccount {
  name?: string;
  avatar?: string;
}

export interface AccountModelState {
  currentAccount?: CurrentAccount;
  hasSysMenu: boolean;
  menus: MenuDataItem[];
  authFuncs: any[];
  defMenuTxt: Map<string, string>;
}

export interface AccountModelType {
  state: AccountModelState;
  effects: {
    fetchCurrent: Effect;
    fetchMenu: Effect;
  };
  reducers: {
    saveCurrentAccout: Reducer<AccountModelState>;
    saveMenu: Reducer<AccountModelState>;
    changeNotifyCount: Reducer<AccountModelState>;
  };
}

const UserModel: AccountModelType = {
  state: {
    currentAccount: {},
    hasSysMenu: true,
    menus: [],
    authFuncs: [],
    defMenuTxt: new Map(),
  },

  effects: {
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      if (response.code === 501) {
        Cookies.remove('Admin-Token');
        message.error('Token已过期，请重新登陆');
      }
      yield put({
        type: 'saveCurrentAccount',
        payload: response.data,
      });
    },
    *fetchMenu({ callback }, { call, put }) {
      yield put({
        type: 'saveMenu',
        payload: {},
      });
      const response = yield call(queryMenu);
      if (callback) callback(response.data);
      yield put({
        type: 'saveMenu',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveCurrentAccount(state: any, action: { payload: any }) {
      return {
        ...state,
        currentAccount: action.payload,
      };
    },
    saveMenu(state, action) {
      return {
        ...state,
        menus: action.payload.menus || [],
        authFuncs: action.payload.authFuncs || [],
        defMenuTxt: action.payload.defTex || new Map(),
      };
    },
    changeNotifyCount(state: any, action) {
      return {
        ...state,
        currentAccout: {
          ...state.currentAccount,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;

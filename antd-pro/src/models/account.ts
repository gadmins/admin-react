import { Effect } from 'dva';
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
    *fetchMenu(_, { call, put }) {
      const response = yield call(queryMenu);
      yield put({
        type: 'saveMenu',
        payload: response.data,
      });
    },
  },

  reducers: {
    saveCurrentAccount(state, action) {
      return {
        ...state,
        currentAccount: action.payload,
      };
    },
    saveMenu(state, action) {
      return {
        ...state,
        menus: action.payload.menus || [],
        defMenuTxt: action.payload.defTex || new Map(),
      };
    },
    changeNotifyCount(
      state = {
        currentAccount: {},
      },
      action,
    ) {
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

import { Effect } from 'dva';
import { Reducer } from 'redux';

import { queryCurrent, queryMenu } from '@/services/accout';
import { MenuDataItem } from '@ant-design/pro-layout';

export interface CurrentAccout {
  name?: string;
  avatar?: string;
}

export interface AccoutModelState {
  currentAccout?: CurrentAccout;
  hasSysMenu: boolean;
  menus: MenuDataItem[];
  defMenuTxt: Map<string, string>;
}

export interface AccoutModelType {
  namespace: 'accout';
  state: AccoutModelState;
  effects: {
    fetchCurrent: Effect;
    fetchMenu: Effect;
  };
  reducers: {
    saveCurrentAccout: Reducer<AccoutModelState>;
    saveMenu: Reducer<AccoutModelState>;
    changeNotifyCount: Reducer<AccoutModelState>;
  };
}

const UserModel: AccoutModelType = {
  namespace: 'accout',

  state: {
    currentAccout: {},
    hasSysMenu: true,
    menus: [],
    defMenuTxt: new Map(),
  },

  effects: {
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentAccout',
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
    saveCurrentAccout(state, action) {
      return {
        ...state,
        currentAccout: action.payload || {},
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
        currentAccout: {},
      },
      action,
    ) {
      return {
        ...state,
        currentAccout: {
          ...state.currentAccout,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

export default UserModel;

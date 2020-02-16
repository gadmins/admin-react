import { Effect } from 'dva';
import { Reducer } from 'redux';

import { queryCurrent, query as queryUsers } from '@/services/accout';

export interface CurrentAccout {
  name?: string;
  avatar?: string;
}

export interface AccoutModelState {
  currentAccout?: CurrentAccout;
}

export interface AccoutModelType {
  namespace: 'accout';
  state: AccoutModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
  };
  reducers: {
    saveCurrentAccout: Reducer<AccoutModelState>;
    changeNotifyCount: Reducer<AccoutModelState>;
  };
}

const UserModel: AccoutModelType = {
  namespace: 'accout',

  state: {
    currentAccout: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentAccout',
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

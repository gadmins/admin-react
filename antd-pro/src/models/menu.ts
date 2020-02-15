import { Effect } from 'dva';
import { Reducer } from 'redux';
import { list } from '@/services/menu';
import { MenuDataItem } from '@ant-design/pro-layout';

export interface MenuModelState {
  menus: MenuDataItem[];
}

export interface MenuModelType {
  namespace: 'menu';
  state: MenuModelState;
  effects: {
    list: Effect;
  };
  reducers: {
    save: Reducer<MenuModelState>;
  };
}
const MenuModel: MenuModelType = {
  namespace: 'menu',
  state: {
    menus: [],
  },
  effects: {
    *list(_, { call, put }) {
      const response = yield call(list);
      yield put({
        type: 'save',
        payload: response.data,
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        menus: action.payload || [],
      };
    },
  },
};
export default MenuModel;

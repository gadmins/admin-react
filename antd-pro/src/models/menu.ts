import { Effect } from 'dva';
import { Reducer } from 'redux';
import { list } from '@/services/menu';
import { MenuDataItem } from '@ant-design/pro-layout';

export interface MenuModelState {
  hasSysMenu: boolean;
  menus: MenuDataItem[];
  defMenuTxt: Map<string, string>;
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
    hasSysMenu: true,
    menus: [],
    defMenuTxt: new Map(),
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
        menus: action.payload.menus || [],
        defMenuTxt: action.payload.defTex || new Map(),
      };
    },
  },
};
export default MenuModel;

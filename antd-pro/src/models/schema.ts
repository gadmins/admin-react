import { Reducer } from 'redux';
import { querySchema, queryTableData } from '@/services/schema';
import { Effect } from 'umi';

export interface StateType {
  funcConfig: any | undefined;
  tableConfig: any | undefined;
}

export interface SchemaModelType {
  state: StateType;
  effects: {
    querySchema: Effect;
  };
  reducers: {
    save: Reducer<StateType>;
  };
}

const Model: SchemaModelType = {
  state: {
    funcConfig: undefined,
    tableConfig: undefined,
  },

  effects: {
    *querySchema({ payload }, { call, put }) {
      yield put({
        type: 'save',
        payload: {
          funcConfig: undefined,
          tableConfig: undefined,
        },
      });
      const response = yield call(querySchema, payload);
      const tableResponse = yield call(queryTableData, payload);
      yield put({
        type: 'save',
        payload: {
          funcConfig: response.data,
          tableConfig: tableResponse.data,
        },
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

export default Model;

import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryList(params?: TableListParams) {
  return request('/adminapi/function/menu', {
    params,
  });
}

export async function refresh() {
  return request('/adminapi/menu/refresh');
}

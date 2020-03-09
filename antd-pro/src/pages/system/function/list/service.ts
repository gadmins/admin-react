import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryList(params?: TableListParams) {
  return request(`/adminapi/function/menu/points/${params!.pid}`, {
    params,
  });
}

export async function update(params: TableListParams) {
  return request(`/adminapi/function/menu/point/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

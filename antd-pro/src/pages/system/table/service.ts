import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryList(params?: TableListParams) {
  return request('/adminapi/db/table', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/adminapi/db/table', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/adminapi/db/table/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/adminapi/db/table/${params.name}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

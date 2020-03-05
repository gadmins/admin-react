import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryList(params?: TableListParams) {
  return request('/dict', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/dict', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/dict/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/dict/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

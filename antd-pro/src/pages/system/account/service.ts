import request from '@/utils/request';
import { TableListParams } from './data';

export async function queryRole(params?: TableListParams) {
  return request('/role', {
    params,
  });
}

export async function queryAllRole() {
  return request('/role/all');
}

export async function queryList(params?: TableListParams) {
  return request('/account', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/account', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/account/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/account/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

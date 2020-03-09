import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryRole(params?: TableListParams) {
  return request('/adminapi/role', {
    params,
  });
}

export async function queryAllRole() {
  return request('/adminapi/role/all');
}

export async function queryList(params?: TableListParams) {
  return request('/adminapi/account', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/adminapi/account', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/adminapi/account/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/adminapi/account/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

import request from '@/utils/request';
import { TableListParams } from './data.d';

export async function queryList(params?: TableListParams) {
  return request('/role', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/role', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/role/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/role/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function getAuthMenus(id: number) {
  return request(`/role/${id}/menucodes`);
}

export async function getMenuTreeAndFunc() {
  return request('/menu/tree/func');
}

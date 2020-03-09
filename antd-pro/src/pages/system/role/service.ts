import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryList(params?: TableListParams) {
  return request('/adminapi/role', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/adminapi/role', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/adminapi/role/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/adminapi/role/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function getAuthMenus(id: number) {
  return request(`/adminapi/role/${id}/menucodes`);
}

export async function getMenuTreeAndFunc() {
  return request('/adminapi/menu/tree/func');
}

import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function queryList(params?: TableListParams) {
  return request('/adminapi/dataway/api', {
    params,
  });
}

export async function getById(id: any) {
  return request(`/adminapi/dataway/api/${id}`);
}

export async function add(params: TableListParams) {
  return request('/adminapi/dataway/api', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/adminapi/dataway/api/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/adminapi/dataway/api/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

export async function publish(id: any) {
  return request(`/adminapi/dataway/api/${id}/publish`, {
    method: 'PUT',
  });
}

export async function offline(id: any) {
  return request(`/adminapi/dataway/api/${id}/offline`, {
    method: 'PUT',
  });
}

export async function testScript(params: any) {
  return request('/adminapi/dataway/test', {
    method: 'GET',
    params,
  });
}

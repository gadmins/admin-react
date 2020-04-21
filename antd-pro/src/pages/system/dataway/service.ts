import request from '@/utils/request';
import { TableListParams } from '@/pages/data';

export async function groupOptions() {
  return request('/adminapi/dataway/group/option');
}

export async function queryList(params?: TableListParams) {
  return request('/adminapi/dataway/group', {
    params,
  });
}

export async function add(params: TableListParams) {
  return request('/adminapi/dataway/group', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export async function remove(ids: number[]) {
  return request(`/adminapi/dataway/group/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function update(params: TableListParams) {
  return request(`/adminapi/dataway/group/${params.id}`, {
    method: 'PUT',
    data: {
      ...params,
    },
  });
}

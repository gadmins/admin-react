import request from '@/utils/request';
import { TableListParams } from './data.d';

export async function queryAccoutList(params?: TableListParams) {
  return request('/accout', {
    params,
  });
}

export async function queryRole(params?: TableListParams) {
  return request('/role', {
    params,
  });
}

export async function queryAllRole() {
  return request('/role/all');
}

export async function removeRule(params: { ids: number[] }) {
  return request('/accout', {
    method: 'POST',
    data: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params: TableListParams) {
  return request('/accout', {
    method: 'POST',
    data: {
      ...params,
      method: 'post',
    },
  });
}

export async function updateRule(params: TableListParams) {
  return request('/accout', {
    method: 'POST',
    data: {
      ...params,
      method: 'update',
    },
  });
}

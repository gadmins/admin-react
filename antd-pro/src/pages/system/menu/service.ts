import request from '@/utils/request';
import { FormValueType } from './components/UpdateForm';

export async function getMenuTree() {
  return request('/adminapi/menu/tree');
}

export async function getMenuParentTree(filterIds?: number[]) {
  if (filterIds) {
    return request(`/adminapi/menu/tree/parent?filterIds=${filterIds.join(',')}`);
  }
  return request('/adminapi/menu/tree/parent');
}

export async function addMenu(params: FormValueType) {
  return request('/adminapi/menu', {
    method: 'POST',
    data: params,
  });
}

export async function updateMenu(params: FormValueType) {
  return request(`/adminapi/menu/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function deleteMenus(ids: number[]) {
  return request(`/adminapi/menu/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function functionList() {
  return request('/adminapi/function/list');
}

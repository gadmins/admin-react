import request from '@/utils/request';
import { FormValueType } from './components/UpdateForm';

export async function getMenuTree() {
  return request('/menu/tree');
}

export async function getMenuParentTree(filterIds?: number[]) {
  if (filterIds) {
    return request(`/menu/tree/parent?filterIds=${filterIds.join(',')}`);
  }
  return request('/menu/tree/parent');
}

export async function addMenu(params: FormValueType) {
  return request('/menu', {
    method: 'POST',
    data: params,
  });
}

export async function updateMenu(params: FormValueType) {
  return request(`/menu/${params.id}`, {
    method: 'PUT',
    data: params,
  });
}

export async function deleteMenus(ids: number[]) {
  return request(`/menu/${ids.join(',')}`, {
    method: 'DELETE',
  });
}

export async function functionList() {
  return request('/function/list');
}

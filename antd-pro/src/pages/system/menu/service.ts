import request from '@/utils/request';

export async function getMenuTree() {
  return request('/menu/tree');
}

import request from '@/utils/request';

export async function queryCurrent(): Promise<any> {
  return request('/accout/currentAccout');
}
export async function queryMenu() {
  return request(`/accout/menu`);
}

export async function queryNotices(): Promise<any> {
  return request('/notices');
}

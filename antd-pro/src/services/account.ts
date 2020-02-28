import request from '@/utils/request';

export async function queryCurrent(): Promise<any> {
  return request('/account/currentAccount');
}
export async function queryMenu() {
  return request(`/account/menu`);
}

export async function queryNotices(): Promise<any> {
  return request('/notices');
}

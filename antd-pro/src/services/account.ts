import request from '@/utils/request';

export async function queryCurrent(): Promise<any> {
  return request('/adminapi/account/currentAccount');
}
export async function queryMenu() {
  return request(`/adminapi/account/menu`);
}

export async function queryNotices(): Promise<any> {
  return request('/adminapi/notices');
}

import request from '@/utils/request';

export async function queryCurrent() {
  return request('/adminapi/account/currentAccount');
}

export async function queryProvince() {
  return request('/api/geographic/province');
}

export async function queryCity(province: string) {
  return request(`/api/geographic/city/${province}`);
}

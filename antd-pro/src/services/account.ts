import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
  type: string;
}

export async function requestLogin(params: LoginParamsType) {
  return request('/adminapi/account/login', {
    method: 'POST',
    data: params,
  });
}

export async function requestLogout() {
  return request('/adminapi/account/logout', { method: 'POST' });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/adminapi/account/login/captcha?mobile=${mobile}`);
}

export async function queryCurrent(): Promise<any> {
  return request('/adminapi/account/currentAccount');
}
export async function queryMenu() {
  return request(`/adminapi/account/menu`);
}

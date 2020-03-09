import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/adminapi/account/login', {
    method: 'POST',
    data: params,
  });
}

export async function fakeAccountLogout() {
  return request('/adminapi/account/logout', { method: 'POST' });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/adminapi/account/login/captcha?mobile=${mobile}`);
}

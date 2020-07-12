import Cookies from 'js-cookie';

const ADMIN_TOKEN = 'Admin-Token';

export const LOGIN_PATH = '/account/login';

export function isLogin() {
  const token = Cookies.get(ADMIN_TOKEN);
  return token !== undefined;
}

export function clearToken() {
  Cookies.remove(ADMIN_TOKEN);
}

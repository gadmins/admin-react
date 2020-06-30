import { useStore } from 'umi';

/**
 * 判断是否有按钮权限
 * @param code 功能编码
 */
export function useAuthorizedBtn(code: string) {
  const store = useStore();
  const { account } = store.getState();
  return account.authFuncs.some((i: any) => i.code === code);
}

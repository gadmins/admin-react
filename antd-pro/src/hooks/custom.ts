import { useModel } from 'umi';
/**
 * 判断是否有按钮权限
 * @param code 功能编码
 */
export function useAuthorizedBtn(code: string) {
  const { initialState } = useModel('@@initialState');
  if (initialState && initialState.menuData) {
    return initialState.menuData.authFuncs.some((i: any) => i.code === code);
  }
  return false;
}

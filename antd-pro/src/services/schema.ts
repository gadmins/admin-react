import request from '@/utils/request';

/**
 * 获取功能Schema
 * @param id 功能ID
 */
export async function querySchema(id: number) {
  return request(`/adminapi/function/schema/${id}`);
}

/**
 * 获取Table数据Schema
 * @param id 功能ID
 */
export async function queryTableData(id: number) {
  return request(`/adminapi/function/tabledata/${id}`);
}

/**
 * 获取表单数据Schema
 * @param id 功能ID
 */
export async function queryFormData(id: number) {
  return request(`/adminapi/function/formdata/${id}`);
}

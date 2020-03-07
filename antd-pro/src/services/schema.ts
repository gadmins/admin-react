import request from '@/utils/request';

export async function querySchema(id: number) {
  return request(`/function/schema/${id}`);
}

import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('accout/list');
}

export async function queryCurrent(): Promise<any> {
  return request('accout/currentAccout');
}

export async function queryNotices(): Promise<any> {
  return request('notices');
}

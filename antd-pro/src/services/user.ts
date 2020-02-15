import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('user/list');
}

export async function queryCurrent(): Promise<any> {
  return request('user/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request('notices');
}

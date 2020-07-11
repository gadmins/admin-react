/* eslint-disable no-param-reassign */
/* eslint-disable global-require */
import React from 'react';
import { Settings, MenuDataItem } from '@ant-design/pro-layout';
import { queryCurrent, queryMenu } from '@/services/account';
import { AccountInfo, MenuData } from '@/models/account';
import { history } from 'umi';
import defaultSettings from '../config/defaultSettings';
import { Resp } from './utils/request';

let firstRoutePath = '/home/welcome';
let menus: MenuDataItem[] = [];

// 创建微服务
const createMicroApp = ({ match }: any, name: string) => {
  const MicroApp = require('@@/plugin-qiankun/MicroApp').MicroApp as any;
  const { url } = match;
  const umiConfigBase = '';
  const runtimeMatchedBase =
    umiConfigBase + (url.endsWith('/') ? url.substr(0, url.length - 1) : url);
  return React.createElement(MicroApp, {
    name,
    base: runtimeMatchedBase,
    history: 'browser',
    settings: {},
  });
};
// 创建微应用路由
const createMicroRoute = (route: any) => {
  route.exact = false;
  route.component = (param: any) => createMicroApp(param, route.microApp);
  return route;
};

export async function qiankun() {
  return {
    apps: [
      {
        name: 'app1', // 唯一 id
        entry: '//localhost:7104/index.html', // html entry
      },
    ],
    lifeCycles: {
      afterMount: (props: any) => {
        console.log(props);
      },
    },
  };
}

/**
 * 初始化State
 */
export async function getInitialState(): Promise<{
  currentAccount: AccountInfo;
  menuData: MenuData;
  rootRoutePath: string;
  settings: Partial<Settings>;
}> {
  const resp = await queryCurrent();
  let respMenu = { data: {} as MenuData };
  if (Resp.isOk(resp)) {
    respMenu = await queryMenu();
    if (respMenu.data) {
      menus = respMenu.data.menus || [];
      firstRoutePath = respMenu.data.menus[0].path || '/home/welcome';
    }
  }
  return {
    currentAccount: resp.data,
    menuData: respMenu.data,
    rootRoutePath: firstRoutePath,
    settings: defaultSettings,
  };
}

// 动态添加路由（含微应用路由）
let extraRoutes: any[] = [];
export async function render(oldRender: () => {}) {
  const remoteRoutes = [
    {
      path: '/user/test',
      microApp: 'app1',
    },
  ];
  extraRoutes = remoteRoutes.map((it) => (it.microApp ? createMicroRoute(it) : it));
  oldRender();
}

export function patchRoutes(params: { routes: any[] }) {
  extraRoutes.forEach((it) => {
    params.routes.push(it);
  });
}

// eslint-disable-next-line no-shadow
function findPath(menus: MenuDataItem[]): string {
  const path: string = '/home/welcome';
  if (menus.length > 0) {
    if (menus[0].path) {
      return menus[0].path;
    }
    if (menus[0].children) {
      return findPath(menus[0].children);
    }
  }
  return path;
}

const findRoutePath = (pathname: string) => {
  const path = '/home/welcome';
  const route = menus.filter((it) => it.path === pathname);
  if (route && route.length === 1 && route[0].children) {
    if (route[0].children[0].path) {
      return route[0].children[0].path;
    }
    if (route[0].children[0].children) {
      return findPath(route[0].children[0].children);
    }
    return '/home/welcome';
  }
  return path;
};

export function onRouteChange({ location = { pathname: '' } }) {
  const { pathname } = location;
  if (pathname === '/') {
    history.replace({
      pathname: firstRoutePath,
    });
    return;
  }
  if (pathname.match(/\//gi)?.length === 1 || pathname.endsWith('/')) {
    history.replace({
      pathname: findRoutePath(pathname),
    });
  }
}

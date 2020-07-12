/* eslint-disable no-restricted-syntax */
/* eslint-disable global-require */
import React from 'react';
import { pathToRegexp } from 'path-to-regexp';
import { MenuDataItem } from '@ant-design/pro-layout';
import { Menu } from 'antd';
import { Link } from 'umi';
import { string2Icon } from './icon';

export const getAllRoutes = () => {
  const UmiRoutes = require('@@/core/routes');
  let allRoutes: any[] = [];
  if (UmiRoutes.routes) {
    allRoutes = UmiRoutes.routes
      .filter((it: any) => it.path === '/')[0]
      .routes[0].routes.filter((it: any) => it.path !== undefined);
  }
  return allRoutes;
};

export const getAuthority = (authFuncs: any[], pathname: string) => {
  const idx = authFuncs
    .filter((it) => it.url)
    .findIndex(
      (it) => pathToRegexp(it.url).exec(pathname) /** history.location.pathname === it.url* */,
    );
  let authority: string | undefined;
  if (authFuncs.length > 0 && idx === -1) {
    const allRoutes = getAllRoutes();
    // 存在且需要认证
    const routeIdx = allRoutes.findIndex((it: any) => pathToRegexp(it.path).exec(pathname));
    if (routeIdx > -1 && allRoutes[routeIdx].authority !== false) {
      authority = 'none';
    }
  }
  return authority;
};

export const parseIcon = (menus: any[]) =>
  menus.map((it: any) => {
    const item = { ...it };
    if (it.icon) {
      item.icon = string2Icon(it.icon);
    }
    if (it.children) {
      item.children = parseIcon(it.children);
    }
    return item;
  });

export const findSubMenuKey = (menuKey: string, menus: MenuDataItem[]) => {
  let key: string | undefined;
  for (const it of menus) {
    if (it.children && it.children.length > 0) {
      if (it.children.filter((m) => m.name === menuKey).length > 0) {
        key = it.name;
        break;
      } else {
        key = findSubMenuKey(menuKey, it.children);
      }
    }
  }
  return key;
};

export function loopMenu(arr: any[], defMenuTxt: any): any[] {
  return arr.map((it) => {
    return it.children ? (
      <Menu.SubMenu key={it.name} icon={it.icon} title={it.name && defMenuTxt[it.name]}>
        {loopMenu(it.children, defMenuTxt)}
      </Menu.SubMenu>
    ) : (
      <Menu.Item key={it.name}>
        <Link
          to={{
            pathname: it.path || '/',
          }}
        >
          {it.icon}
          {it.name && defMenuTxt[it.name]}
        </Link>
      </Menu.Item>
    );
  });
}

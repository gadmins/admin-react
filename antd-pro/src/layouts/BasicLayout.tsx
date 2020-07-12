/* eslint-disable global-require */
/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  DefaultFooter,
  SettingDrawer,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { Link, useIntl, history, useModel } from 'umi';
import { Dispatch } from 'redux';
import { Result, Button, Menu } from 'antd';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';

import logo from '@/assets/logo.svg';
import { pathToRegexp } from 'path-to-regexp';
import { MenuData } from '@/models/account';
import {
  parseIcon,
  getAuthority,
  getAllRoutes,
  findSubMenuKey,
  loopMenu,
} from '@/utils/menu.utils';
import { Route } from 'antd/lib/breadcrumb/Breadcrumb';
import defaultSettings from '../../config/defaultSettings';
import './BasicLayout.less';

const enableI18n = false;

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="对不起，您无权访问此页面"
    extra={
      <Button type="primary">
        <Link to="/">去主页</Link>
      </Button>
    }
  />
);

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  dispatch: Dispatch;
  menus: MenuDataItem[];
  authFuncs: any[];
  defMenuTxt: Map<string, string>;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

const defaultFooterDom = <DefaultFooter copyright={defaultSettings.copyright} links={[]} />;

const footerRender: BasicLayoutProps['footerRender'] = () => {
  return <>{defaultFooterDom}</>;
};

const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const { settings = defaultSettings, menuData = {} as MenuData } = initialState || {};
  const { children } = props;
  const location = props.location as any;
  const intl = useIntl();

  const menus = parseIcon(menuData.menus);
  const defMenuTxt = menuData.defTex;
  const { authFuncs } = menuData;

  const [leftMenuData, setLeftMenuData] = useState(menus);
  const [leftMenuSelectKey, setLeftMenuSelectKey] = useState('');
  const [leftOpenKeys, setLeftOpenKeys] = useState<string[]>([]);

  const authority = getAuthority(authFuncs, location.pathname);

  const formatMessage = (e: any) => {
    const defTxt = e.defaultMessage && defMenuTxt[e.defaultMessage];
    if (defTxt) {
      e.defaultMessage = defTxt;
    }
    if (enableI18n === false) {
      return e.defaultMessage;
    }
    return intl.formatMessage(e);
  };

  // 监听路由变化：处理菜单的选择和打开
  useEffect(() => {
    const last: string = location.pathname;
    if (settings.layout === 'mix' && settings.splitMenus) {
      const idx = menus.findIndex((it) => it.name === last.split('/')[1]);
      if (idx > -1) {
        setLeftMenuData(menus[idx].children);
      }
    } else {
      setLeftMenuData(menus);
    }
    const allRoutes = getAllRoutes();
    const routeIdx = allRoutes.findIndex((it: any) => pathToRegexp(it.path).exec(last));
    setTimeout(() => {
      if (routeIdx > -1) {
        const keys = last.split('/');
        const menuKey = keys[2];
        const subKey = findSubMenuKey(menuKey, leftMenuData);
        setLeftMenuSelectKey(menuKey);
        if (subKey) {
          setLeftOpenKeys([subKey]);
        }
        const { title, name } = allRoutes[routeIdx];
        const pageTitle = title || defMenuTxt[name];
        if (pageTitle && pageTitle !== '') {
          document.title = `${pageTitle}-${defaultSettings.title}`;
        } else {
          document.title = defaultSettings.title;
        }
      } else {
        document.title = defaultSettings.title;
      }
    }, 10);
    return () => {};
  }, [location.pathname]);

  /**
   * 自定义左侧导航菜单
   */
  const menuContentRender =
    settings.layout === 'mix' && settings.splitMenus
      ? () => (
          <Menu
            mode="inline"
            theme={settings.navTheme}
            openKeys={leftOpenKeys}
            selectedKeys={[leftMenuSelectKey]}
            onOpenChange={(keys) => {
              setLeftOpenKeys(keys);
            }}
          >
            {loopMenu(leftMenuData, defMenuTxt)}
          </Menu>
        )
      : undefined;

  const customProps: any = {
    /**
     * 自定义导航面包屑
     */
    breadcrumbRender: (routers: Route[] = []) => {
      const newRouters = routers.map((it) => {
        const keys = it.path.split('/');
        return {
          path: it.path,
          breadcrumbName: formatMessage({ defaultMessage: keys[2] }),
        };
      });
      const last: string = location.pathname;
      const keys = last.split('/');
      const findMenus = menus.filter((it) => it.name === keys[1]);
      const path = findMenus.length > 0 ? findMenus[0].path.replace(findMenus[0].key, '') : '';
      return [
        {
          path,
          breadcrumbName: formatMessage({ defaultMessage: keys[1] }),
        },
        ...newRouters,
      ];
    },
    menuItemRender: (menuItemProps: any, defaultDom: any) => {
      if (menuItemProps.isUrl || !menuItemProps.path) {
        return defaultDom;
      }
      return (
        <Link to={menuItemProps.path}>
          {menuItemProps.icon} {menuItemProps.name}
        </Link>
      );
    },
    itemRender: (route: any, _: any, routes: any[], paths: any[]) => {
      const first = routes.indexOf(route) === 0;
      return first ? (
        <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
      ) : (
        <span>{route.breadcrumbName}</span>
      );
    },
  };
  if (menuContentRender) {
    customProps.menuContentRender = menuContentRender;
  }

  return (
    <>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        onMenuHeaderClick={() => history.push(initialState?.rootRoutePath)}
        footerRender={footerRender}
        menuDataRender={() => menus || []}
        rightContentRender={() => <RightContent />}
        {...props}
        {...settings}
        {...customProps}
      >
        <Authorized authority={authority} noMatch={noMatch}>
          {children}
        </Authorized>
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={(config) => {
          if (initialState) {
            setInitialState({
              ...initialState,
              settings: config,
            });
          }
        }}
      />
    </>
  );
};

export default BasicLayout;

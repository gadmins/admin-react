/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
  DefaultFooter,
} from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { Link, useIntl, history } from 'umi';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Result, Button, Menu, Breadcrumb } from 'antd';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { isAntDesignPro } from '@/utils/utils';

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { WithFalse } from '@ant-design/pro-layout/lib/typings';
import { string2Icon } from '@/utils/icon';
import { Route } from 'antd/lib/breadcrumb/Breadcrumb';
import logo from '@/assets/logo.svg';
import defaultSettings from '../../config/defaultSettings';

const UmiRoutes = require('@@/core/routes');

const allRoutes: any[] = UmiRoutes.routes[1].routes[0].routes.filter(
  (it: any) => it.path !== undefined,
);

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
  settings: Settings;
  dispatch: Dispatch;
  hasSysMenu: boolean;
  menus: MenuDataItem[];
  authFuncs: any[];
  defMenuTxt: Map<string, string>;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

const defaultFooterDom = <DefaultFooter copyright="2020 通用管理系统" links={[]} />;

const footerRender: BasicLayoutProps['footerRender'] = () => {
  if (!isAntDesignPro()) {
    return defaultFooterDom;
  }
  return (
    <>
      {defaultFooterDom}
      <div
        style={{
          padding: '0px 24px 24px',
          textAlign: 'center',
        }}
      >
        <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer">
          <img
            src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg"
            width="82px"
            alt="netlify logo"
          />
        </a>
      </div>
    </>
  );
};
let lastFuncId: number | undefined;
let lastMenuKey: string | undefined;
let lastPatname: string | undefined;
const BasicLayout: React.FC<BasicLayoutProps> = (props) => {
  const {
    dispatch,
    children,
    settings,
    hasSysMenu,
    menus,
    authFuncs,
    defMenuTxt,
    collapsed,
  } = props;
  const location = props.location as any;
  const intl = useIntl();
  // 权限准备完毕
  const [ready, setReady] = useState<boolean>(false);
  // 默认有权限,authority = 'none' 无权限
  const [authority, setAuthority] = useState<string | undefined>(undefined);

  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'account/fetchCurrent',
      });
      dispatch({
        type: 'account/fetchMenu',
        callback: (data: any) => {
          if (location.pathname === '/') {
            history.push(data.menus[0].path);
          }
        },
      });
    }
  }, []);

  const formatMsg = (id: String, key: string) => {
    const e: any = { id };
    if (!e.defaultMessage) {
      e.defaultMessage = key;
    }
    const defTxt = e.defaultMessage && defMenuTxt[e.defaultMessage];
    if (defTxt) {
      e.defaultMessage = defTxt;
    }
    return intl.formatMessage(e);
  };

  /**
   * init variables
   */
  const handleMenuCollapse = (payload: boolean): void => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };
  history.listen(({ pathname }) => {
    if (pathname === '/account/login') {
      lastPatname = '/account/login';
      lastFuncId = undefined;
      lastMenuKey = undefined;
    }
  });
  const showPage = () => {
    setReady(false);
    // 显示界面
    setTimeout(() => {
      setReady(true);
      lastPatname = history.location.pathname;
    }, 10);
  };
  const onOpenChange = (keys: WithFalse<string[]>) => {
    if (lastPatname && history.location.pathname === lastPatname) {
      return;
    }
    const idx = authFuncs.findIndex((it) => history.location.pathname === it.url);
    if (!keys || keys.length === 0) {
      let auth;
      if (idx === -1) {
        // 存在且需要认证
        const routeIdx = allRoutes.findIndex((it: any) => it.path === history.location.pathname);
        if (routeIdx > -1 && allRoutes[routeIdx].authority !== false) {
          auth = 'none';
        }
      }
      setAuthority(auth);
      showPage();
      return;
    }
    let childs: any[] = menus;
    const bcs: any[] = [];
    let menuKey = '';
    keys.forEach((k) => {
      if (k === '/') {
        bcs.push({
          path: `/#${menus[0].path}`,
          name: formatMsg(`menu.${menus[0].key}`, 'home'),
        });
      } else {
        menuKey += `.${k}`;
        const midx = childs.findIndex((it) => it.key === k);
        if (midx > -1) {
          bcs.push({
            name: formatMsg(`menu.${menuKey}.${childs[midx].key}`, childs[midx].key),
          });
          childs = childs[midx].children;
        }
      }
    });
    setBreadcrumbs(bcs);

    lastMenuKey = keys[keys.length - 1];
    if (idx > -1) {
      if (!location.state) {
        location.state = {};
      }
      if (authFuncs[idx].id) {
        location.state.funcId = authFuncs[idx].id;
      }
    }
    if (location.state && lastFuncId && lastFuncId === location.state.funcId) {
      if (ready === false || history.location.pathname !== lastPatname) {
        setAuthority(undefined);
        showPage();
      }
      return;
    }
    if (location.state && location.state.funcId) {
      lastFuncId = location.state.funcId;
      dispatch({
        type: 'schema/querySchema',
        payload: lastFuncId,
      });
    }
    setAuthority(undefined);
    showPage();
  };
  const CustomMenu = () => {
    let curKey: string[] = [];
    let curIdx = -1;
    const pathkeys = location.pathname
      ? location.pathname.split('/').filter((it: any) => it !== '')
      : [];
    if (pathkeys.length > 0) {
      curKey = [pathkeys[0]];
      if (menus.length > 0) {
        curIdx = menus.findIndex((it) => it.name === pathkeys[0]);
      }
    }
    const customMenuDataRender = () => {
      if (!hasSysMenu) {
        return menus;
      }
      if (curIdx === -1) {
        return [];
      }
      return menus[curIdx] ? menus[curIdx].children || [] : [];
    };

    let sysMenus: {
      icon: any;
      name?: string;
      defTxt: any;
      path?: string;
      funcId?: string;
    }[] = [];

    const customHeaderRender = () => (
      <div className="ant-pro-global-header">
        <span
          onClick={() => {
            handleMenuCollapse(!collapsed);
          }}
          className="ant-pro-global-header-trigger"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </span>
        {hasSysMenu && (
          <Menu
            mode="horizontal"
            selectedKeys={curKey}
            style={{
              border: 'none',
            }}
            onClick={({ key }) => {
              curIdx = menus.findIndex((it) => it.name === key);
            }}
          >
            {sysMenus.map((it) => (
              <Menu.Item key={it.name}>
                <Link
                  to={{
                    pathname: it.path || '/',
                    state: {
                      funcId: it.funcId,
                    },
                  }}
                >
                  {it.icon}
                  {it.name && defMenuTxt[it.name]}
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        )}
        {!hasSysMenu && (
          <Breadcrumb>
            {breadcrumbs.map((b) => (
              <Breadcrumb.Item>{b.path ? <a href={b.path}>{b.name}</a> : b.name}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
        <RightContent />
      </div>
    );
    const customBreadcrumbRender = (routers: Route[] = []) => [
      {
        path: `/${menus[curIdx] ? menus[curIdx].path || '/' : ''}`,
        breadcrumbName: intl.formatMessage({
          id: `menu.${curKey[0] || 'home'}`,
          defaultMessage: curKey[0] || 'Home',
        }),
      },
      ...routers,
    ];
    if (hasSysMenu) {
      sysMenus = menus.map((it) => ({
        icon: it.icon,
        name: it.name,
        defTxt: it.defTxt,
        path: it.path,
        funcId: it.funcId,
      }));
    }
    return {
      breadcrumbRender: hasSysMenu ? customBreadcrumbRender : undefined,
      headerRender: customHeaderRender,
      menuDataRender: customMenuDataRender,
    };
  };

  const customProps = CustomMenu();
  return (
    <ProLayout
      logo={logo}
      title={defaultSettings.title}
      menuHeaderRender={(logoDom, titleDom) => (
        <Link to="/">
          {logoDom}
          {titleDom}
        </Link>
      )}
      onOpenChange={onOpenChange}
      onCollapse={handleMenuCollapse}
      menuProps={{
        onClick: (item) => {
          if (item.key === lastMenuKey) {
            return;
          }
          setReady(false);
        },
      }}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }
        return (
          <Link
            to={{
              pathname: menuItemProps.path,
              state: {
                funcId: menuItemProps.funcId,
              },
            }}
          >
            {defaultDom}
          </Link>
        );
      }}
      itemRender={(route, _, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      formatMessage={(e) => {
        const defTxt = e.defaultMessage && defMenuTxt[e.defaultMessage];
        if (defTxt) {
          e.defaultMessage = defTxt;
        }
        return intl.formatMessage(e);
      }}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
      {...customProps}
    >
      {ready && (
        <Authorized authority={authority} noMatch={noMatch}>
          {children}
        </Authorized>
      )}
    </ProLayout>
  );
};

const parseIcon = (menus: any[]) =>
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

export default connect(({ global, account }: ConnectState) => ({
  collapsed: global.collapsed,
  hasSysMenu: account.hasSysMenu,
  menus: parseIcon(account.menus),
  authFuncs: account.authFuncs,
  defMenuTxt: account.defMenuTxt,
}))(BasicLayout);

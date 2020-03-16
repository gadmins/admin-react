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
import { Result, Button, Menu } from 'antd';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { isAntDesignPro } from '@/utils/utils';

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { WithFalse } from '@ant-design/pro-layout/lib/typings';
import { string2Icon } from '@/utils/icon';
import { Route } from 'antd/lib/breadcrumb/Breadcrumb';
import defaultSettings from '../../config/defaultSettings';
import logo from '../assets/logo.svg';

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
const BasicLayout: React.FC<BasicLayoutProps> = props => {
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
  const showPage = () => {
    setReady(false);
    // 显示界面
    setTimeout(() => {
      setReady(true);
    }, 1);
  };
  const onOpenChange = (keys: WithFalse<string[]>) => {
    if (!keys || keys.length === 0) {
      // FIXME： 需优化
      setAuthority('none');
      showPage();
      return;
    }
    // 查找menu
    let child: any[] = [];
    keys.forEach(key => {
      if (key === '/') {
        child = menus;
      } else {
        const f = child.filter(
          it => it.children && it.children.some((item: any) => item.key === key),
        );
        if (f && f.length > 0) {
          child = f[0].children;
        }
      }
    });
    const idx = child.findIndex(it => it.key === keys[keys.length - 1]);
    if (idx > -1) {
      // 找到menu,将funcId附在location.state进行传递, 解决页面获取funcId
      if (!location.state) {
        location.state = {};
      }
      if (child[idx].funcId) {
        location.state.funcId = child[idx].funcId;
      }
    }
    // 计算是否有权限
    if (location.state && location.state.funcId) {
      if (authFuncs.findIndex((i: any) => i.id === location.state.funcId) === -1) {
        setAuthority('none');
      } else {
        setAuthority(undefined);
      }
    } else {
      setAuthority(undefined);
    }
    if (location.state && lastFuncId === location.state.funcId) {
      // showPage();
      return;
    }
    if (location.state && location.state.funcId) {
      lastFuncId = location.state.funcId;
      lastMenuKey = keys[keys.length - 1];
    }
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
        curIdx = menus.findIndex(it => it.name === pathkeys[0]);
      }
    }

    const customMenuDataRender = () => {
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
        <Menu
          mode="horizontal"
          selectedKeys={curKey}
          style={{
            border: 'none',
          }}
          onClick={({ key }) => {
            curIdx = menus.findIndex(it => it.name === key);
          }}
        >
          {sysMenus.map(it => (
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
      sysMenus = menus.map(it => ({
        icon: it.icon,
        name: it.name,
        defTxt: it.defTxt,
        path: it.path,
        funcId: it.funcId,
      }));
    }
    return {
      breadcrumbRender: customBreadcrumbRender,
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
        onClick: item => {
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
      itemRender={(route, params, routes, paths) => {
        const first = routes.indexOf(route) === 0;
        return first ? (
          <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
        ) : (
          <span>{route.breadcrumbName}</span>
        );
      }}
      footerRender={footerRender}
      formatMessage={e => {
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
    if (it.icon) {
      it.icon = string2Icon(it.icon);
    }
    if (it.children) {
      it.children = parseIcon(it.children);
    }
    return it;
  });

export default connect(({ global, account }: ConnectState) => ({
  collapsed: global.collapsed,
  hasSysMenu: account.hasSysMenu,
  menus: parseIcon(account.menus),
  authFuncs: account.authFuncs,
  defMenuTxt: account.defMenuTxt,
}))(BasicLayout);

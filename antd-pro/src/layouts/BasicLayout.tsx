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
import React, { useEffect } from 'react';
import { Link } from 'umi';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Icon, Result, Button, Menu } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';

import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import { isAntDesignPro, getAuthorityFromRouter } from '@/utils/utils';

import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { WithFalse } from '@ant-design/pro-layout/lib/typings';
import logo from '../assets/logo.svg';

const noMatch = (
  <Result
    status="403"
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/accout/login">Go Login</Link>
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

const BasicLayout: React.FC<BasicLayoutProps> = props => {
  const {
    dispatch,
    children,
    settings,
    hasSysMenu,
    menus,
    defMenuTxt,
    collapsed,
    location = { pathname: '/' },
  } = props;
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'accout/fetchCurrent',
      });
      dispatch({
        type: 'accout/fetchMenu',
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
  // get children authority
  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };

  const onOpenChange = (keys: WithFalse<string[]>) => {
    if (!location.state && keys) {
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
        location.state = { funcId: child[idx].funcId };
      }
    }
  };

  const CustomMenu = () => {
    let curKey: string[] = [];
    let curIdx = -1;
    const pathkeys = location.pathname ? location.pathname.split('/').filter(it => it !== '') : [];
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
                <Icon type={it.icon} />
                {it.name && defMenuTxt[it.name]}
              </Link>
            </Menu.Item>
          ))}
        </Menu>
        <RightContent />
      </div>
    );
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
      headerRender: customHeaderRender,
      menuDataRender: customMenuDataRender,
    };
  };

  const customProps = CustomMenu();

  return (
    <ProLayout
      logo={logo}
      menuHeaderRender={(logoDom, titleDom) => (
        <Link to="/">
          {logoDom}
          {titleDom}
        </Link>
      )}
      onOpenChange={onOpenChange}
      onCollapse={handleMenuCollapse}
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
      breadcrumbRender={(routers = []) => [
        {
          path: '/',
          breadcrumbName: formatMessage({
            id: 'menu.home',
            defaultMessage: 'Home',
          }),
        },
        ...routers,
      ]}
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
        return formatMessage(e);
      }}
      rightContentRender={() => <RightContent />}
      {...props}
      {...settings}
      {...customProps}
    >
      <Authorized authority={authorized!.authority} noMatch={noMatch}>
        {children}
      </Authorized>
    </ProLayout>
  );
};

export default connect(({ global, settings, accout }: ConnectState) => ({
  collapsed: global.collapsed,
  hasSysMenu: accout.hasSysMenu,
  menus: accout.menus,
  defMenuTxt: accout.defMenuTxt,
  settings,
}))(BasicLayout);

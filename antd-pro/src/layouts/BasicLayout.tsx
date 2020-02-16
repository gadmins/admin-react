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

const defaultFooterDom = (
  <DefaultFooter
    copyright="2019 蚂蚁金服体验技术部出品"
    links={[
      {
        key: 'Ant Design Pro',
        title: 'Ant Design Pro',
        href: 'https://pro.ant.design',
        blankTarget: true,
      },
      {
        key: 'github',
        title: <Icon type="github" />,
        href: 'https://github.com/ant-design/ant-design-pro',
        blankTarget: true,
      },
      {
        key: 'Ant Design',
        title: 'Ant Design',
        href: 'https://ant.design',
        blankTarget: true,
      },
    ]}
  />
);

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
        type: 'menu/list',
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

  const CustomMenu = () => {
    let curKey: string[] = [];
    let curIdx = -1;
    const pathkeys = location.pathname ? location.pathname.split('/').filter(it => it !== '') : [];
    if (pathkeys.length > 0) {
      curKey = [pathkeys[0]];
      curIdx = menus.findIndex(it => it.name === pathkeys[0]);
    }

    const customMenuDataRender = () => {
      if (curIdx === -1) {
        return [];
      }
      return menus[curIdx] ? menus[curIdx].children || [] : [];
    };

    let sysMenus: {
      icon: any;
      name: string | undefined;
      defTxt: any;
      path: string | undefined;
    }[] = [];

    const customHeaderRender = () => (
      <div className="ant-pro-global-header">
        <span
          onClick={() => {
            handleMenuCollapse(!collapsed);
          }}
          className="ant-pro-global-header-trigger"
        >
          <i aria-label="图标: menu-fold" className="anticon anticon-menu-fold">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              className=""
              data-icon="menu-fold"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M408 442h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8zm-8 204c0 4.4 3.6 8 8 8h480c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H408c-4.4 0-8 3.6-8 8v56zm504-486H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 632H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM115.4 518.9L271.7 642c5.8 4.6 14.4.5 14.4-6.9V388.9c0-7.4-8.5-11.5-14.4-6.9L115.4 505.1a8.74 8.74 0 0 0 0 13.8z" />
            </svg>
          </i>
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
              <Link to={it.path || '/'}>
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
      onCollapse={handleMenuCollapse}
      menuItemRender={(menuItemProps, defaultDom) => {
        if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
          return defaultDom;
        }
        return <Link to={menuItemProps.path}>{defaultDom}</Link>;
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

export default connect(({ global, settings, menu }: ConnectState) => ({
  collapsed: global.collapsed,
  hasSysMenu: menu.hasSysMenu,
  menus: menu.menus,
  defMenuTxt: menu.defMenuTxt,
  settings,
}))(BasicLayout);

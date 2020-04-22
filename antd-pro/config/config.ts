import { defineConfig, utils } from 'umi';
import proxy from './proxy';
import webpackPlugin from './plugin.config';

const { ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION, REACT_APP_ENV } = process.env;
const { winPath } = utils;
export default defineConfig({
  antd: {
    // dark: true,
    // compact: true,
  },
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  pwa: false,
  history: {
    type: 'hash',
  },
  hash: true,
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/zh/guide/router.html
  routes: [
    {
      path: '/account',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/account/login',
          component: './account/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          routes: [
            {
              path: '/',
              redirect: '/home/welcome',
            },
            {
              name: 'welcome',
              icon: 'smile',
              path: '/home/welcome',
              component: './Welcome',
            },
            {
              name: 'account',
              icon: 'smile',
              path: '/system/account',
              component: './system/account',
            },
            {
              name: 'menu',
              icon: 'smile',
              path: '/system/menu',
              component: './system/menu',
            },
            {
              name: 'function',
              icon: 'smile',
              path: '/system/function',
              component: './system/function',
            },
            {
              name: 'functionbtns',
              icon: 'smile',
              path: '/system/function/list/:pid',
              component: './system/function/list',
            },
            {
              name: 'dict',
              icon: 'smile',
              path: '/system/dict',
              component: './system/dict',
            },
            {
              name: 'dictdata',
              icon: 'smile',
              path: '/system/dict/list/:id',
              component: './system/dict/list',
            },
            {
              name: 'role',
              icon: 'smile',
              path: '/system/role',
              component: './system/role',
            },
            {
              name: 'accountsettings',
              icon: 'smile',
              path: '/system/accountsettings',
              component: './system/accountsettings',
            },
            {
              name: 'table',
              icon: 'db',
              path: '/system/table',
              component: './system/table',
            },
            {
              name: 'table',
              icon: 'db',
              path: '/system/table/struct/:name',
              component: './system/table/struct',
            },
            {
              name: 'table',
              icon: 'db',
              path: '/system/table/data/:name',
              component: './system/table/data',
            },
            {
              name: 'dataway',
              path: '/system/dataway',
              component: './system/dataway',
            },
            {
              name: 'apilist',
              path: '/system/dataway/:groupId/apilist',
              component: './system/dataway/apilist',
            },
            {
              name: 'addapi',
              path: '/system/dataway/addapi/:groupId',
              component: './system/dataway/apilist/edit',
            },
            {
              name: 'editapi',
              path: '/system/dataway/editapi/:id',
              component: './system/dataway/apilist/edit',
            },
            {
              name: 'tool',
              icon: 'cloud',
              path: '/system/tool',
              component: './system/tool',
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
  },
  define: {
    REACT_APP_ENV: REACT_APP_ENV || false,
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION:
      ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION || '', // preview.pro.ant.design only do not use in your production ; preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
  },
  ignoreMomentLocale: true,
  lessLoader: {
    javascriptEnabled: true,
  },
  cssLoader: {
    // 这里的 modules 可以接受 getLocalIdent
    modules: {
      getLocalIdent: (
        context: {
          resourcePath: string;
        },
        _: string,
        localName: string,
      ) => {
        if (
          context.resourcePath.includes('node_modules') ||
          context.resourcePath.includes('ant.design.pro.less') ||
          context.resourcePath.includes('global.less')
        ) {
          return localName;
        }

        const match = context.resourcePath.match(/src(.*)/);

        if (match && match[1]) {
          const antdProPath = match[1].replace('.less', '');
          const arr = winPath(antdProPath)
            .split('/')
            .map((a: string) => a.replace(/([A-Z])/g, '-$1'))
            .map((a: string) => a.toLowerCase());
          return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
        }

        return localName;
      },
    },
  },
  manifest: {
    basePath: '/',
  },
  proxy: proxy[REACT_APP_ENV || 'dev'],
  chainWebpack: webpackPlugin,
});

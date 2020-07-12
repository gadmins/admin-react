import { Settings as ProSettings } from '@ant-design/pro-layout';

type DefaultSettings = ProSettings & {
  pwa: boolean;
  desc: string;
  copyright: string;
};
const title = '通用管理系统';

const proSettings: DefaultSettings = {
  navTheme: 'dark',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  splitMenus: true,
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    locale: true,
  },
  title,
  iconfontUrl: '',
  pwa: false,
  desc: '通用管理系统-接口+后台管理一体化',
  copyright: `2020 ${title}`,
};

export type { DefaultSettings };

export default proSettings;

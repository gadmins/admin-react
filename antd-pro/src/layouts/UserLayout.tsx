import { DefaultFooter, MenuDataItem, getMenuData, getPageTitle } from '@ant-design/pro-layout';
import { Helmet } from 'react-helmet';
import { Link, useIntl, useLocation } from 'umi';
import React from 'react';

import SelectLang from '@/components/SelectLang';
import { ConnectProps } from '@/models/connect';
import logo from '../assets/logo.svg';
import styles from './UserLayout.less';
import defaultSettings from '../../config/defaultSettings';

export interface UserLayoutProps extends ConnectProps {
  breadcrumbNameMap: { [path: string]: MenuDataItem };
  route: {
    routes: any[];
  };
}

const UserLayout: React.FC<UserLayoutProps> = (props) => {
  const location = useLocation();
  const { children } = props;
  const { formatMessage } = useIntl();
  const { breadcrumb } = getMenuData(props.route.routes);
  const title = getPageTitle({
    pathname: location.pathname,
    breadcrumb,
    formatMessage,
    ...props,
  });
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.lang}>
          <SelectLang />
        </div>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>{defaultSettings.title}</span>
              </Link>
            </div>
            <div className={styles.desc}>{defaultSettings.desc}</div>
          </div>
          {children}
        </div>
        <DefaultFooter copyright={defaultSettings.copyright} links={[]} />
      </div>
    </>
  );
};

export default UserLayout;

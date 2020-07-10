/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormattedMessage, useIntl } from 'umi';
import React, { Fragment, useState } from 'react';

import { List } from 'antd';

type Unpacked<T> = T extends (infer U)[] ? U : T;

const passwordStrength = {
  strong: (
    <span className="strong">
      <FormattedMessage id="accountsettings.security.strong" defaultMessage="Strong" />
    </span>
  ),
  medium: (
    <span className="medium">
      <FormattedMessage id="accountsettings.security.medium" defaultMessage="Medium" />
    </span>
  ),
  weak: (
    <span className="weak">
      <FormattedMessage id="accountsettings.security.weak" defaultMessage="Weak" />
      Weak
    </span>
  ),
};

export default ({ handle = (type: string) => {} }) => {
  const intl = useIntl();
  const { formatMessage } = intl;
  const [data, setData] = useState([
    {
      title: formatMessage({ id: 'accountsettings.security.password' }, {}),
      description: (
        <Fragment>
          {formatMessage({ id: 'accountsettings.security.password-description' })}：
          {passwordStrength.strong}
        </Fragment>
      ),
      actions: [
        <a
          key="Modify"
          onClick={() => {
            if (handle) {
              handle('pwd');
            }
          }}
        >
          <FormattedMessage id="accountsettings.security.modify" defaultMessage="Modify" />
        </a>,
      ],
    },
  ]);
  return (
    <Fragment>
      <List<Unpacked<typeof data>>
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item actions={item.actions}>
            <List.Item.Meta title={item.title} description={item.description} />
          </List.Item>
        )}
      />
    </Fragment>
  );
};

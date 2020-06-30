import { UploadOutlined } from '@ant-design/icons';
import { Button, Input, Upload, Form, message } from 'antd';
import { FormattedMessage, injectIntl, IntlShape, connect } from 'umi';
import React, { Component, Fragment } from 'react';

import { CurrentUser } from '../data.d';
// import GeographicView from './GeographicView';
// import PhoneView from './PhoneView';
import styles from './BaseView.less';

const FormItem = Form.Item;

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatar }: { avatar: string }) => (
  <Fragment>
    <div className={styles.avatar_title}>
      <FormattedMessage id="accountsettings.basic.avatar" defaultMessage="Avatar" />
    </div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload showUploadList={false}>
      <div className={styles.button_view}>
        <Button>
          <UploadOutlined />
          <FormattedMessage
            id="accountsettings.basic.change-avatar"
            defaultMessage="Change avatar"
          />
        </Button>
      </div>
    </Upload>
  </Fragment>
);
// interface SelectItem {
//   label: string;
//   key: string;
// }

// const validatorGeographic = (
//   _: any,
//   value: {
//     province: SelectItem;
//     city: SelectItem;
//   },
//   callback: (message?: string) => void,
// ) => {
//   const { province, city } = value;
//   if (!province.key) {
//     callback('Please input your province!');
//   }
//   if (!city.key) {
//     callback('Please input your city!');
//   }
//   callback();
// };

// const validatorPhone = (rule: any, value: string, callback: (message?: string) => void) => {
//   const values = value.split('-');
//   if (!values[0]) {
//     callback('Please input your area code!');
//   }
//   if (!values[1]) {
//     callback('Please input your phone number!');
//   }
//   callback();
// };

interface BaseViewProps {
  currentUser?: CurrentUser;
  intl: IntlShape;
}

class BaseView extends Component<BaseViewProps> {
  view: HTMLDivElement | undefined = undefined;

  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser) {
      if (currentUser.avatar) {
        return currentUser.avatar;
      }
      const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png';
      return url;
    }
    return '';
  }

  getViewDom = (ref: HTMLDivElement) => {
    this.view = ref;
  };

  handleFinish = () => {
    const { formatMessage } = this.props.intl;
    message.success(formatMessage({ id: 'accountsettings.basic.update.success' }));
  };

  render() {
    const { currentUser } = this.props;
    const { formatMessage } = this.props.intl;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form
            layout="vertical"
            onFinish={this.handleFinish}
            initialValues={currentUser}
            hideRequiredMark
          >
            <FormItem
              name="email"
              label={formatMessage({ id: 'accountsettings.basic.email' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'accountsettings.basic.email-message' }, {}),
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem
              name="name"
              label={formatMessage({ id: 'accountsettings.basic.nickname' })}
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'accountsettings.basic.nickname-message' }, {}),
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem>
              <Button htmlType="submit" type="primary">
                <FormattedMessage
                  id="accountsettings.basic.update"
                  defaultMessage="Update Information"
                />
              </Button>
            </FormItem>
          </Form>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={this.getAvatarURL()} />
        </div>
      </div>
    );
  }
}

export default connect(
  ({ accountSettings }: { accountSettings: { currentUser: CurrentUser } }) => ({
    currentUser: accountSettings.currentUser,
  }),
)(injectIntl(BaseView));

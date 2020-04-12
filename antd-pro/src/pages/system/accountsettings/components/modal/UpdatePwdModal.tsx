import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import request, { Resp } from '@/utils/request';
import MD5 from 'crypto-js/md5';
import { connect } from 'dva';

const service = {
  modifyPwd(data: any) {
    return request('/adminapi/account/modifyPwd', {
      method: 'PUT',
      data,
    });
  },
};

const FormItem = Form.Item;

interface FormProps {
  modalVisible: boolean;
  onCancel: () => void;
  dispatch: any;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

const UpdatePwdModal = (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onCancel, dispatch } = props;
  const [form] = Form.useForm();

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    fieldsValue.oldPwd = MD5(fieldsValue.oldPwd).toString();
    fieldsValue.newPwd = MD5(fieldsValue.newPwd).toString();
    const rs = await service.modifyPwd(fieldsValue);
    if (Resp.isOk(rs)) {
      message.success('修改成功，请重新登录');
      form.resetFields();
      onCancel();
      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }
    } else {
      message.error(rs.msg);
    }
  };

  return (
    <Modal
      destroyOnClose
      visible={modalVisible}
      title="修改密码"
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form form={form}>
        <FormItem
          {...formLayout}
          label="原密码"
          name="oldPwd"
          rules={[{ required: true, message: '原密码不能为空' }]}
        >
          <Input placeholder="请输入原密码" />
        </FormItem>
        <FormItem
          {...formLayout}
          hasFeedback
          label="新密码"
          name="newPwd"
          rules={[{ required: true, message: '新密码不能为空' }]}
        >
          <Input.Password placeholder="请输入新密码" />
        </FormItem>
        <FormItem
          {...formLayout}
          hasFeedback
          label="确认密码"
          name="newConfirmPwd"
          dependencies={['newPwd']}
          rules={[
            { required: true, message: '确认密码不能为空' },
            ({ getFieldValue }) => ({
              validator(rule, value) {
                if (!value || getFieldValue('newPwd') === value) {
                  return Promise.resolve();
                }
                // eslint-disable-next-line prefer-promise-reject-errors
                return Promise.reject('两次密码输入不一致');
              },
            }),
          ]}
        >
          <Input.Password placeholder="请输入确认密码" />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default connect()(UpdatePwdModal);

import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import MD5 from 'crypto-js/md5';
import { queryAllRole } from '../service';

const FormItem = Form.Item;
interface FormProps {
  modalVisible: boolean;
  initVals?: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;
  const [roles, setRoles] = useState<any[]>([]);
  const [form] = Form.useForm();
  const initialValues = initVals
    ? {
        name: initVals.name,
        roles: initVals.roles.map((it: any) => it.id),
        password: '123456',
      }
    : {
        password: '123456',
      };
  if (form) {
    form.resetFields();
  }
  useEffect(() => {
    queryAllRole().then(data => {
      if (data && data.code === 200) {
        setRoles(data.data);
      }
    });
  }, []);

  const okHandle = async () => {
    if (!form.isFieldsTouched()) {
      message.warn('请修改后提交');
      return;
    }
    const fieldsValue = await form.validateFields();
    fieldsValue.password = MD5(fieldsValue.password).toString();
    const rs: boolean = await onSubmit(fieldsValue);
    if (rs) {
      form.resetFields();
    }
  };
  return (
    <Modal
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title={initVals ? '复制账户' : '创建账户'}
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form form={form} initialValues={initialValues}>
        <input type="text" style={{ display: 'none' }} />
        <FormItem
          {...formLayout}
          label="账号"
          name="name"
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="登录密码"
          name="password"
          rules={[{ required: true, message: '账号不能为空' }]}
        >
          <Input placeholder="请输入密码" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="角色类型"
          name="roles"
          rules={[{ required: true, message: '角色不能为空' }]}
        >
          <Select mode="multiple" placeholder="请选择">
            {roles && roles.map(it => <Select.Option value={it.id}>{it.name}</Select.Option>)}
          </Select>
        </FormItem>
      </Form>
    </Modal>
  );
};

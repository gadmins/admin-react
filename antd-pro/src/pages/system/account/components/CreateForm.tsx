import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import SchemaForm, { useForm, createFormActions, ISchema } from '@formily/antd';
import { setup } from '@formily/antd-components';
import MD5 from 'crypto-js/md5';
import { queryAllRole } from '../service';

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
setup();
const actions = createFormActions();

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;
  const [roles, setRoles] = useState<any[]>([]);
  const initialValues = initVals
    ? {
        name: initVals.name,
        roles: initVals.roles.map((it: any) => it.id),
        password: '123456',
      }
    : {
        password: '123456',
      };

  const form = useForm({
    value: initialValues,
    actions,
  });

  const schema: ISchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: '账号',
        'x-props': {
          placeholder: '请输入账号',
        },
        'x-rules': [
          {
            required: true,
            message: '账号不能为空',
          },
        ],
      },
      password: {
        type: 'password',
        'x-props': {
          checkStrength: true,
        },
        title: '登录密码',
        'x-rules': [
          {
            required: true,
            message: '登录密码不能为空',
          },
        ],
      },
      roles: {
        type: 'string',
        title: '角色类型',
        required: true,
        'x-props': {
          placeholder: '请选择',
          mode: 'multiple',
        },
        'x-rules': [
          {
            required: true,
            message: '角色不能为空',
          },
        ],
        enum: roles.map(it => ({
          value: it.id,
          label: it.name,
        })),
      },
    },
  };

  useEffect(() => {
    queryAllRole().then(data => {
      if (data && data.code === 200) {
        setRoles(data.data);
      }
    });
  }, []);

  const okHandle = async () => {
    try {
      await form.validate();
      await form.submit(async (values: any) => {
        const params = { ...values };
        params.password = MD5(params.password).toString();
        const rs: boolean = await onSubmit(params);
        if (rs) {
          form.reset();
        }
      });
      // eslint-disable-next-line no-empty
    } catch (error) {}
  };
  return (
    <Modal
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title={initVals ? '复制账户' : '创建账户'}
      onOk={okHandle}
      onCancel={() => {
        form.reset();
        onCancel();
      }}
    >
      <SchemaForm schema={schema} form={form} {...formLayout} />
    </Modal>
  );
};

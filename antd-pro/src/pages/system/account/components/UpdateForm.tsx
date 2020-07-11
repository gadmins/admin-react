import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import SchemaForm, { createFormActions, ISchema } from '@formily/antd';
import { Resp } from '@/utils/request';
import { queryAllRole } from '../service';

interface FormProps {
  modalVisible: boolean;
  initVals: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
const actions = createFormActions();

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;
  const [roles, setRoles] = useState<any[]>([]);
  const initialValues = initVals
    ? {
        id: initVals.id,
        roles: initVals.roles.map((it: any) => it.id),
      }
    : {};

  const schema: ISchema = {
    type: 'object',
    properties: {
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
        enum: roles.map((it) => ({
          value: it.id,
          label: it.name,
        })),
      },
    },
  };
  useEffect(() => {
    queryAllRole().then((data) => {
      if (Resp.isOk(data)) {
        setRoles(data.data);
      }
    });
  }, []);

  const okHandle = async () => {
    try {
      await actions.validate();
      await actions.submit(async (values: any) => {
        const rs: boolean = await onSubmit(values);
        if (rs) {
          actions.reset();
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
      title="编辑账户"
      onOk={okHandle}
      onCancel={() => {
        actions.reset();
        onCancel();
      }}
    >
      <SchemaForm initialValues={initialValues} schema={schema} actions={actions} {...formLayout} />
    </Modal>
  );
};

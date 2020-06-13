import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import SchemaForm, { useForm, createFormActions, ISchema, IForm } from '@formily/antd';
import { setup } from '@formily/antd-components';
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
setup();
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

  const form = useForm({
    value: initialValues,
    actions,
  }) as IForm;
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
      await form.validate();
      await form.submit(async (values: any) => {
        const rs: boolean = await onSubmit(values);
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
      title="编辑账户"
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

import React from 'react';
import { Modal } from 'antd';
import SchemaForm, { createFormActions, ISchema } from '@formily/antd';

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
const actions = createFormActions();

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;

  const initialValues = initVals
    ? {
        title: initVals.title,
        dcode: initVals.dcode,
      }
    : {};
  const schema: ISchema = {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        title: '字典名',
        required: true,
      },
      dcode: {
        type: 'string',
        title: '字典编码',
        required: true,
      },
    },
  };
  const okHandle = async () => {
    try {
      await actions.validate();
      await actions.submit(async (values) => {
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
      title={initVals ? '复制字典' : '创建字典'}
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

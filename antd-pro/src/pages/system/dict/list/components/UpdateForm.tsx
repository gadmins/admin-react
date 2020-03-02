import React from 'react';
import { Modal } from 'antd';
import SchemaForm, { useForm, createFormActions, ISchema } from '@formily/antd';
import { setup } from '@formily/antd-components';

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
  const initialValues = initVals
    ? {
        id: initVals.id,
        pid: initVals.pid,
        indexValue: initVals.indexValue,
        dvalue: initVals.dvalue,
      }
    : {};
  const form = useForm({
    value: initialValues,
    actions,
  });
  const schema: ISchema = {
    type: 'object',
    properties: {
      indexValue: {
        type: 'number',
        title: '字典键值',
        required: true,
      },
      dvalue: {
        type: 'string',
        title: '字典标签',
        required: true,
      },
    },
  };
  const okHandle = async () => {
    try {
      await form.validate();
      await form.submit(async values => {
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
      title={initVals ? '复制字典' : '创建字典'}
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

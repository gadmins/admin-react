import React from 'react';
import { Modal, Form, Input, message } from 'antd';

const FormItem = Form.Item;
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

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;
  const [form] = Form.useForm();
  const initialValues = initVals
    ? {
        id: initVals.id,
        name: initVals.name,
        rcode: initVals.rcode,
        rdesc: initVals.rdesc,
      }
    : {};
  if (form) {
    form.resetFields();
  }

  const okHandle = async () => {
    if (!form.isFieldsTouched()) {
      message.warn('请修改后提交');
      return;
    }
    const fieldsValue = await form.validateFields();
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
      title="编辑角色"
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form form={form} initialValues={initialValues}>
        <FormItem name="id">
          <Input type="hidden" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="角色名"
          name="name"
          rules={[{ required: true, message: '角色名不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="角色编码"
          name="rcode"
          rules={[{ required: true, message: '角色编码不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="角色描述"
          name="rdesc"
          rules={[{ required: true, message: '角色描述不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
      </Form>
    </Modal>
  );
};

import React from 'react';
import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;
interface FormProps {
  modalVisible: boolean;
  initVals: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;
  const [form] = Form.useForm();
  const initialValues = initVals
    ? {
        tableName: initVals.name,
        tableComment: initVals.comment,
      }
    : {};

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    fieldsValue.newName = fieldsValue.name;
    fieldsValue.name = initVals.tableName;
    const rs: boolean = await onSubmit({
      name: initVals.tableName,
      newName: fieldsValue.tableName,
      comment: fieldsValue.tableComment,
    });
    if (rs) {
      form.resetFields();
    }
  };
  return (
    <Modal
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title="编辑表"
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form form={form} initialValues={initialValues}>
        <FormItem
          {...formLayout}
          label="表名"
          name="tableName"
          rules={[{ required: true, message: '表名不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="表注释"
          name="tableComment"
          rules={[{ required: true, message: '表注释不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
      </Form>
    </Modal>
  );
};

import React from 'react';
import { Modal, Form, Input, Switch, Col, Row } from 'antd';

const FormItem = Form.Item;
interface FormProps {
  modalVisible: boolean;
  initVals?: any;
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
    : {
        hasDelete: false,
        hasCreateApi: true,
      };

  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    const rs: boolean = await onSubmit({
      name: fieldsValue.tableName,
      comment: fieldsValue.tableComment,
      hasDelete: fieldsValue.hasDelete,
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
      title={initVals ? '复制表' : '创建表'}
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
        {initVals === undefined && (
          <Row>
            <Col span={12}>
              <FormItem
                labelCol={{ span: 10 }}
                label="逻辑删除"
                name="hasDelete"
                valuePropName="checked"
              >
                <Switch />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                labelCol={{ span: 12 }}
                label="默认RestApi"
                name="hasCreateApi"
                valuePropName="checked"
              >
                <Switch />
              </FormItem>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

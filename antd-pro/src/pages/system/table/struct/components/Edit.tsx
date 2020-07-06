/* eslint-disable no-empty */
import React, { useState } from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber } from 'antd';

const { Option } = Select;

interface FormProps {
  modalVisible: boolean;
  initVals?: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 18 },
};

const hasLength = (value: string | undefined) => {
  return value === 'int' || value === 'varchar' || value === 'tinyint';
};

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, initVals, onCancel, onSubmit } = props;
  const defFormValue = initVals || {
    isNull: true,
  };
  const [form] = Form.useForm();
  const [unsigned, setUnsigned] = useState(defFormValue.unsigned !== undefined);
  const [canLength, setCanLength] = useState(hasLength(defFormValue.columnType));
  const okHandle = async () => {
    try {
      const fieldsValue = await form.validateFields();
      if (initVals) {
        fieldsValue.oldColumnName = initVals.columnName;
      }
      const rs: boolean = await onSubmit(fieldsValue);
      if (rs) {
        form.resetFields();
      }
    } catch (e) {}
  };
  const onTypeChange = (value: string) => {
    setUnsigned(value === 'int');
    const canLen = hasLength(value);
    setCanLength(canLen);
    if (canLen) {
      const lengs = { int: 11, tinyint: 1, varchar: 20 };
      form.setFieldsValue({
        valueLength: lengs[value],
      });
    } else {
      form.setFieldsValue({
        valueLength: undefined,
      });
    }
  };
  return (
    <Modal
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title={initVals ? '编辑字段' : '添加字段'}
      onOk={okHandle}
      onCancel={() => {
        onCancel();
      }}
    >
      <Form
        form={form}
        {...layout}
        initialValues={defFormValue}
        onFinish={() => {}}
        onFinishFailed={() => {}}
      >
        <Form.Item
          label="字段名"
          name="columnName"
          rules={[{ required: true, message: '请输入字段名!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="columnType" label="类型" rules={[{ required: true }]}>
          <Select placeholder="请选择类型" onChange={onTypeChange} allowClear>
            <Option value="int">int</Option>
            <Option value="tinyint">tinyint</Option>
            <Option value="double">double</Option>
            <Option value="enum">enum</Option>
            <Option value="varchar">varchar</Option>
            <Option value="text">text</Option>
            <Option value="mediumtext">mediumtext</Option>
            <Option value="timestamp">timestamp</Option>
          </Select>
        </Form.Item>
        {unsigned && (
          <Form.Item label="无符号" valuePropName="checked" name="unsigned">
            <Switch />
          </Form.Item>
        )}
        {canLength && (
          <Form.Item
            label="长度"
            name="valueLength"
            rules={[{ required: true, message: '请设置长度!' }]}
          >
            <InputNumber />
          </Form.Item>
        )}
        <Form.Item label="默认值" name="defValue">
          <Input />
        </Form.Item>
        <Form.Item label="是否为空" valuePropName="checked" name="isNull">
          <Switch />
        </Form.Item>
        <Form.Item label="注释" name="columnComment">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

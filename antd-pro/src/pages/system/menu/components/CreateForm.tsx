import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Radio, Modal } from 'antd';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import React, { useState } from 'react';
import { FormValueType } from './UpdateForm';

const FormItem = Form.Item;

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  formVals?: FormValueType;
  onSubmit: (fieldsValue: { desc: string }) => void;
  onCancel: () => void;
}

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, formVals, form, onSubmit: handleAdd, onCancel } = props;

  const [type, setType] = useState('SYS_MENU');
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      destroyOnClose
      title={formVals ? '复制菜单' : '添加菜单'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => onCancel()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单类型">
        {form.getFieldDecorator('type', {
          initialValue: formVals ? formVals.type : type,
          rules: [{ required: true }],
        })(
          <Radio.Group
            disabled={formVals !== null}
            onChange={e => {
              setType(e.target.value);
            }}
          >
            <Radio value="SYS_MENU">系统菜单</Radio>
            <Radio value="NAV_MENU">导航菜单</Radio>
            <Radio value="MENU">菜单</Radio>
          </Radio.Group>,
        )}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单名">
        {form.getFieldDecorator('txt', {
          initialValue: formVals ? formVals.title : '',
          rules: [{ required: true, message: '菜单名不能为空' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单编码">
        {form.getFieldDecorator('mcode', {
          initialValue: formVals ? formVals.key : '',
          rules: [{ required: true, message: '菜单编码不能为空' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="菜单排序">
        {form.getFieldDecorator('sortNumber', {
          initialValue: formVals ? formVals.sortNumber : 0,
          rules: [{ required: true }],
        })(<Input type="number" placeholder="请输入" />)}
      </FormItem>
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateForm);

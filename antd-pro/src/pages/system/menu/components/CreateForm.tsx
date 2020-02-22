import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Input, Radio, Modal, Switch, TreeSelect } from 'antd';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import React, { useState, useEffect } from 'react';
import { FormValueType } from './UpdateForm';
import { getMenuParentTree } from '../service';

const FormItem = Form.Item;
const { TreeNode } = TreeSelect;

interface CreateFormProps extends FormComponentProps {
  modalVisible: boolean;
  formVals?: FormValueType;
  onSubmit: (fieldsValue: { desc: string }) => boolean;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

const loopNode = (data: any) =>
  data.map((item: any) => {
    if (item.children && item.children.length) {
      return (
        <TreeNode key={item.key} value={item.id} title={item.title} bind={item}>
          {loopNode(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode key={item.key} value={item.id} title={item.title} bind={item} />;
  });

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, formVals, form, onSubmit: handleAdd, onCancel } = props;
  const [parentMenus, setParentMenus] = useState([]);
  useEffect(() => {
    getMenuParentTree().then(data => {
      if (data && data.code === 200) {
        setParentMenus(data.data);
      }
    });
  }, []);
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const rs: boolean = handleAdd(fieldsValue);
      if (rs) {
        form.resetFields();
      }
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
      <FormItem {...formLayout} label="菜单类型">
        {form.getFieldDecorator('type', {
          initialValue: formVals ? formVals.type : 'SYS_MENU',
          rules: [{ required: true }],
        })(
          <Radio.Group disabled={formVals !== null}>
            <Radio value="SYS_MENU">系统菜单</Radio>
            <Radio value="NAV_MENU">导航菜单</Radio>
            <Radio value="MENU">菜单</Radio>
          </Radio.Group>,
        )}
      </FormItem>
      {form.getFieldValue('type') !== 'SYS_MENU' && (
        <FormItem {...formLayout} label="父级菜单">
          {form.getFieldDecorator('parentId', {
            initialValue: formVals ? formVals.parentId : undefined,
            rules: [{ required: true, message: '父级菜单不能为空' }],
          })(
            <TreeSelect
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择"
              allowClear
              treeDefaultExpandAll
            >
              {loopNode(parentMenus)}
            </TreeSelect>,
          )}
        </FormItem>
      )}
      <FormItem {...formLayout} label="菜单名">
        {form.getFieldDecorator('txt', {
          initialValue: formVals ? formVals.title : '',
          rules: [{ required: true, message: '菜单名不能为空' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="菜单编码">
        {form.getFieldDecorator('mcode', {
          initialValue: formVals ? `${formVals.key}1` : '',
          rules: [{ required: true, message: '菜单编码不能为空' }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="菜单icon">
        {form.getFieldDecorator('icon', {
          initialValue: formVals ? formVals.icon : '',
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem {...formLayout} label="菜单排序">
        {form.getFieldDecorator('sortNumber', {
          initialValue: formVals ? formVals.sortNumber : 0,
          rules: [{ required: true, message: '排序不能为空' }],
        })(<Input type="number" placeholder="请输入" />)}
      </FormItem>
      {form.getFieldValue('type') === 'MENU' && (
        <>
          <FormItem {...formLayout} label="功能关联">
            {form.getFieldDecorator('funcId', {})(<Input placeholder="请输入" />)}
          </FormItem>
          <FormItem {...formLayout} label="是否外链">
            {form.getFieldDecorator('elink', {
              initialValue: formVals ? formVals.elink : false,
            })(<Switch />)}
          </FormItem>
          <FormItem {...formLayout} label="菜单链接">
            {form.getFieldDecorator('url', {
              initialValue: formVals ? formVals.url : '',
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </>
      )}
    </Modal>
  );
};

export default Form.create<CreateFormProps>()(CreateForm);

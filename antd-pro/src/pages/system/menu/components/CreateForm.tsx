import React, { useState, useEffect } from 'react';
import { Input, Radio, Modal, Switch, TreeSelect, Form } from 'antd';
import { FormValueType } from './UpdateForm';
import { getMenuParentTree, functionList } from '../service';

const FormItem = Form.Item;
const { TreeNode } = TreeSelect;

interface CreateFormProps {
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
        <TreeNode key={item.id} value={item.id} title={item.title} bind={item}>
          {loopNode(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode key={item.id} value={item.id} title={item.title} bind={item} />;
  });

const CreateForm: React.FC<CreateFormProps> = props => {
  const { modalVisible, formVals, onSubmit: handleAdd, onCancel } = props;
  const [form] = Form.useForm();
  const [parentMenus, setParentMenus] = useState([]);
  const [functions, setFunctions] = useState([]);
  const initVals = formVals
    ? {
        ...formVals,
        mcode: `${formVals.key}1`,
        txt: formVals.title,
        elink: formVals.elink || false,
        type: formVals.type || 'SYS_MENU',
      }
    : { type: 'SYS_MENU' };
  const [type, setType] = useState(initVals.type);
  useEffect(() => {
    getMenuParentTree().then(data => {
      if (data && data.code === 200) {
        setParentMenus(data.data);
      }
    });
    functionList().then(data => {
      if (data && data.code === 200) {
        setFunctions(data.data);
      }
    });
  }, []);
  const okHandle = async () => {
    const fieldsValue = await form.validateFields();
    const rs: boolean = handleAdd(fieldsValue);
    if (rs) {
      form.resetFields();
    }
  };
  return (
    <Modal
      destroyOnClose
      title={formVals ? '复制菜单' : '添加菜单'}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form form={form} initialValues={initVals}>
        <FormItem {...formLayout} label="菜单类型" name="type" rules={[{ required: true }]}>
          <Radio.Group
            disabled={formVals !== undefined}
            onChange={({ target }) => {
              setType(target.value);
            }}
          >
            <Radio value="SYS_MENU">系统菜单</Radio>
            <Radio value="NAV_MENU">导航菜单</Radio>
            <Radio value="MENU">菜单</Radio>
          </Radio.Group>
        </FormItem>
        {type !== 'SYS_MENU' && parentMenus.length > 0 && (
          <FormItem
            {...formLayout}
            label="父级菜单"
            name="parentId"
            rules={[{ required: true, message: '父级菜单不能为空' }]}
          >
            <TreeSelect
              value={formVals ? formVals.parentId : undefined}
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择"
              allowClear
              treeDefaultExpandAll
            >
              {loopNode(parentMenus)}
            </TreeSelect>
          </FormItem>
        )}
        <FormItem
          {...formLayout}
          label="菜单名"
          name="txt"
          rules={[{ required: true, message: '菜单名不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="菜单编码"
          name="mcode"
          rules={[{ required: true, message: '菜单编码不能为空' }]}
        >
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem {...formLayout} label="菜单icon" name="icon">
          <Input placeholder="请输入" />
        </FormItem>
        <FormItem
          {...formLayout}
          label="菜单排序"
          name="sortNumber"
          rules={[{ required: true, message: '排序不能为空' }]}
        >
          <Input type="number" placeholder="请输入" />
        </FormItem>
        {type === 'MENU' && functions.length > 0 && (
          <>
            <FormItem {...formLayout} label="功能关联" name="funcId">
              <TreeSelect
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                allowClear
                treeDefaultExpandAll
              >
                {loopNode(functions)}
              </TreeSelect>
            </FormItem>
            <FormItem {...formLayout} label="是否外链" name="elink" valuePropName="checked">
              <Switch />
            </FormItem>
            <FormItem {...formLayout} label="菜单链接" name="url">
              <Input placeholder="请输入" />
            </FormItem>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CreateForm;

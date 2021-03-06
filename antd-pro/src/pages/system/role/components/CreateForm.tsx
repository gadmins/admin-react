import React, { useEffect, useState } from 'react';
import { Tree, Modal, Form, Input, message } from 'antd';
import { getMenuTreeAndFunc, getAuthMenus } from '../service';

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
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [menuIds, setMenuIds] = useState<number[]>([]);
  const [funcIds, setFuncIds] = useState<number[]>([]);
  const [authKeys, setKeys] = useState<string[]>(['home', 'welcome', 'accountsettings']);

  const [form] = Form.useForm();
  const initialValues = initVals
    ? {
        name: initVals.name,
        rcode: initVals.rcode,
        rdesc: initVals.rdesc,
      }
    : {};

  useEffect(() => {
    if (initVals) {
      Promise.all([getMenuTreeAndFunc(), getAuthMenus(initVals.id)]).then(
        ([treeData, authData]) => {
          if (authData && authData.data) {
            setMenuIds(authData.data.menuIds);
            setFuncIds(authData.data.funcIds);
            setKeys(authData.data.keys);
          }
          if (treeData && treeData.data) {
            setMenuTree(treeData.data);
          }
        },
      );
    } else {
      getMenuTreeAndFunc().then((data) => {
        if (data && data.data) {
          setMenuTree(data.data);
        }
      });
    }
  }, []);

  const okHandle = async () => {
    if (menuIds.length === 0 && funcIds.length === 0) {
      message.error('请分配权限');
      return;
    }
    const fieldsValue = await form.validateFields();
    fieldsValue.menuIds = menuIds;
    fieldsValue.funcIds = funcIds;
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
      title={initVals ? '复制角色' : '创建角色'}
      onOk={okHandle}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
    >
      <Form form={form} initialValues={initialValues}>
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
        {menuTree && menuTree.length > 0 && (
          <FormItem {...formLayout} label="角色权限">
            <Tree
              showLine
              blockNode
              checkable
              height={500}
              selectable={false}
              defaultCheckedKeys={authKeys}
              defaultExpandAll
              treeData={menuTree}
              onCheck={(_, { checkedNodes }) => {
                const mIds: number[] = [];
                const fIds: number[] = [];
                checkedNodes.forEach((it: any) => {
                  if (it.type === 'FUNC') {
                    fIds.push(it.id);
                  } else {
                    mIds.push(it.id);
                  }
                });
                setMenuIds(mIds);
                setFuncIds(fIds);
              }}
            />
          </FormItem>
        )}
      </Form>
    </Modal>
  );
};

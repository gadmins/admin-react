import React, { useState, useEffect } from 'react';
import { Button, Input, Radio, Switch, TreeSelect, Form, message } from 'antd';
import { Resp } from '@/utils/request';
import { getMenuParentTree, functionList } from '../service';

const FormItem = Form.Item;
const { TreeNode } = TreeSelect;

export interface FormValueType {
  [prop: string]: any;
}

export interface UpdateFormProps {
  // onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => void;
  // updateModalVisible: boolean;
  values: FormValueType;
}

const loopNode = (data: any) =>
  data.map((item: any) => {
    if (item.children && item.children.length) {
      return (
        <TreeNode key={item.id} value={item.id} title={`${item.title}-${item.key}`}>
          {loopNode(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode key={item.id} value={item.id} title={`${item.title}-${item.key}`} />;
  });

const formLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10 },
};

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const { values } = props;
  const [parentMenus, setParentMenus] = useState([]);
  const [functions, setFunctions] = useState<any[]>([]);
  const [form] = Form.useForm();

  const updateParentMenus = (type: string, ids?: number[]) => {
    if (type === 'SYS_MENU') {
      return;
    }
    getMenuParentTree(ids).then((data) => {
      if (Resp.isOk(data)) {
        setParentMenus(data.data);
      }
    });
  };

  useEffect(() => {
    updateParentMenus(values.type, [values.id]);
    if (values.type === 'MENU') {
      functionList().then((data) => {
        if (Resp.isOk(data)) {
          setFunctions(data.data);
        }
      });
    }
  }, []);
  // updateFormVals = (formVals: FormValueType) => {
  //   // form.resetFields();
  //   this.setState({
  //     formVals,
  //   });
  //   this.updateParentMenus(formVals.type, [formVals.id]);
  // };

  const handleSubmit = async () => {
    const { onSubmit: handleUpdate } = props;
    if (!form.isFieldsTouched()) {
      message.warn('请修改后提交');
      return;
    }
    const fieldsValue = await form.validateFields();
    handleUpdate({
      ...fieldsValue,
      id: values.id,
    });
  };
  return (
    <Form
      form={form}
      initialValues={{
        ...values,
        mcode: values.key,
        txt: values.title,
        elink: values.elink || false,
      }}
      onFinish={handleSubmit}
      onFinishFailed={(e) => {
        form.scrollToField(e.errorFields[0].name);
      }}
    >
      <FormItem {...formLayout} label="菜单类型" name="type" rules={[{ required: true }]}>
        <Radio.Group disabled>
          <Radio value="SYS_MENU">系统菜单</Radio>
          <Radio value="NAV_MENU">导航菜单</Radio>
          <Radio value="MENU">菜单</Radio>
        </Radio.Group>
      </FormItem>
      {values.type !== 'SYS_MENU' && parentMenus.length > 0 && (
        <FormItem
          {...formLayout}
          label="父级菜单"
          name="parentId"
          // rules={[{ required: true, message: '父级菜单不能为空' }]}
        >
          <TreeSelect
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
        label="菜单名称"
        name="txt"
        rules={[{ required: true, message: '菜单名称不能为空' }]}
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
      <FormItem {...formLayout} label="菜单排序" name="sortNumber">
        <Input type="number" min={0} placeholder="请输入" />
      </FormItem>
      {values.type === 'MENU' && functions.length > 0 && (
        <>
          <FormItem {...formLayout} label="功能组关联" name="funcId">
            <TreeSelect
              showSearch
              style={{ width: '100%' }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="请选择"
              allowClear
              treeDefaultExpandAll
              filterTreeNode={(input, option) => {
                if (option?.title) {
                  return option.title.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return false;
              }}
              onChange={(e) => {
                const func = functions.filter((it) => it.id === e);
                if (func && func.length > 0) {
                  form.setFieldsValue({
                    url: func[0].url,
                    elink: func[0].elink,
                  });
                }
              }}
            >
              {loopNode(functions)}
            </TreeSelect>
          </FormItem>
          <FormItem {...formLayout} label="是否外链" name="elink" valuePropName="checked">
            <Switch />
          </FormItem>
          <FormItem
            {...formLayout}
            label="菜单链接"
            name="url"
            rules={[{ required: true, message: '菜单链接不能为空' }]}
          >
            <Input placeholder="请输入" />
          </FormItem>
        </>
      )}
      <FormItem wrapperCol={{ span: 10, offset: 3 }}>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
        <Button
          style={{ marginLeft: 8 }}
          type="primary"
          htmlType="button"
          onClick={() => {
            form.resetFields();
          }}
        >
          重置
        </Button>
      </FormItem>
    </Form>
  );
};

export default UpdateForm;

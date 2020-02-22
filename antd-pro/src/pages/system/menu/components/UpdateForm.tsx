import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Radio, Switch, TreeSelect } from 'antd';
import React, { Component } from 'react';

import { FormComponentProps } from '@ant-design/compatible/es/form';
import { getMenuParentTree, functionList } from '../service';

const FormItem = Form.Item;
const { TreeNode } = TreeSelect;

export interface FormValueType {
  id: number;
  type: string;
  icon: string;
  title: string;
  key: string;
  sortNumber: number;
  elink: boolean;
  url: string;
  parentId?: number;
  funcId?: number;
}
export interface UpdateFormState {
  formVals: FormValueType;
  parentMenus: any[];
  functions: any[];
}

export interface UpdateFormProps extends FormComponentProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => void;
  updateModalVisible: boolean;
  values: FormValueType;
}

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

class UpdateForm extends Component<UpdateFormProps, UpdateFormState> {
  formLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 10 },
  };

  static defaultProps = {
    handleUpdate: () => {},
    values: {},
  };

  constructor(props: UpdateFormProps) {
    super(props);
    this.state = {
      functions: [],
      parentMenus: [],
      formVals: {
        ...props.values,
      },
    };
    this.updateParentMenus(props.values.type, [props.values.id]);
    functionList().then(data => {
      if (data && data.code === 200) {
        this.setState({
          functions: data.data,
        });
      }
    });
  }

  updateFormVals = (formVals: FormValueType) => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      formVals,
    });
    this.updateParentMenus(formVals.type, [formVals.id]);
  };

  updateParentMenus = (type: string, ids?: number[]) => {
    if (type === 'SYS_MENU') {
      return;
    }
    getMenuParentTree(ids).then(data => {
      if (data && data.code === 200) {
        this.setState({
          parentMenus: data.data,
        });
      }
    });
  };

  handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const { form, onSubmit: handleUpdate } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      if (!form.isFieldsTouched()) {
        return;
      }
      handleUpdate(fieldsValue);
    });
  };

  render() {
    const { form } = this.props;
    const { formVals, parentMenus, functions } = this.state;
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem>
          {form.getFieldDecorator('id', {
            initialValue: formVals.id,
          })(<Input type="hidden" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="菜单类型">
          {form.getFieldDecorator('type', {
            initialValue: formVals.type,
            rules: [{ required: true }],
          })(
            <Radio.Group
              disabled
              onChange={e => {
                this.setState({
                  formVals: {
                    ...formVals,
                    type: e.target.value,
                  },
                });
              }}
            >
              <Radio value="SYS_MENU">系统菜单</Radio>
              <Radio value="NAV_MENU">导航菜单</Radio>
              <Radio value="MENU">菜单</Radio>
            </Radio.Group>,
          )}
        </FormItem>
        {form.getFieldValue('type') !== 'SYS_MENU' && (
          <FormItem {...this.formLayout} label="父级菜单">
            {form.getFieldDecorator('parentId', {
              initialValue: formVals.parentId,
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
        <FormItem {...this.formLayout} label="菜单名称">
          {form.getFieldDecorator('txt', {
            initialValue: formVals.title,
            rules: [{ required: true, message: '菜单名称不能为空' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="菜单编码">
          {form.getFieldDecorator('mcode', {
            initialValue: formVals.key,
            rules: [{ required: true, message: '菜单编码不能为空' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="菜单icon">
          {form.getFieldDecorator('icon', {
            initialValue: formVals.icon,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="菜单排序">
          {form.getFieldDecorator('sortNumber', {
            initialValue: formVals.sortNumber,
            rules: [{ required: true, message: '菜单排序不能为空' }],
          })(<Input type="number" placeholder="请输入" />)}
        </FormItem>
        {formVals.type === 'MENU' && (
          <>
            <FormItem {...this.formLayout} label="功能关联">
              {form.getFieldDecorator('funcId', {
                initialValue: formVals.funcId,
              })(
                <TreeSelect
                  style={{ width: '100%' }}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择"
                  allowClear
                  treeDefaultExpandAll
                >
                  {loopNode(functions)}
                </TreeSelect>,
              )}
            </FormItem>
            <FormItem {...this.formLayout} label="是否外链">
              {form.getFieldDecorator('elink', {
                initialValue: formVals.elink,
              })(<Switch />)}
            </FormItem>
            <FormItem {...this.formLayout} label="菜单链接">
              {form.getFieldDecorator('url', {
                initialValue: formVals.url,
              })(<Input placeholder="请输入" />)}
            </FormItem>
          </>
        )}
        <FormItem wrapperCol={{ span: 10, offset: 3 }}>
          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default Form.create<UpdateFormProps>()(UpdateForm);

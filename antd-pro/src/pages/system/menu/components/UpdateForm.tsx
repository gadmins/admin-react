import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import { Button, Input, Radio } from 'antd';
import React, { Component } from 'react';

import { FormComponentProps } from '@ant-design/compatible/es/form';

const FormItem = Form.Item;

export interface FormValueType {
  id: number;
  type: string;
  title: string;
  key: string;
  sortNumber: number;
}
export interface UpdateFormState {
  formVals: FormValueType;
}

export interface UpdateFormProps extends FormComponentProps {
  onCancel: (flag?: boolean, formVals?: FormValueType) => void;
  onSubmit: (values: FormValueType) => void;
  updateModalVisible: boolean;
  values: FormValueType;
}

class UpdateForm extends Component<UpdateFormProps, UpdateFormState> {
  static defaultProps = {
    handleUpdate: () => {},
    values: {},
  };

  formLayout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 10 },
  };

  constructor(props: UpdateFormProps) {
    super(props);
    this.state = {
      formVals: {
        ...props.values,
      },
    };
  }

  updateFormVals = (formVals: FormValueType) => {
    this.setState({
      formVals,
    });
  };

  handleSubmit = () => {
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      console.log('handleSubmit', fieldsValue);
    });
  };

  render() {
    const { form } = this.props;
    const { formVals } = this.state;
    return (
      <Form onSubmit={this.handleSubmit}>
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
        <FormItem {...this.formLayout} label="菜单名">
          {form.getFieldDecorator('txt', {
            initialValue: formVals.title,
            rules: [{ required: true, message: '菜单名不能为空' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="菜单编码">
          {form.getFieldDecorator('mcode', {
            initialValue: formVals.key,
            rules: [{ required: true, message: '菜单编码不能为空' }],
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="菜单排序">
          {form.getFieldDecorator('sortNumber', {
            initialValue: formVals.sortNumber,
            rules: [{ required: true, message: '菜单排序不能为空' }],
          })(<Input type="number" placeholder="请输入" />)}
        </FormItem>
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

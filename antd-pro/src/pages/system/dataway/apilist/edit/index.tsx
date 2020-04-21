import React from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useParams } from 'dva';
import { history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';
import { Button, message, Form, Input } from 'antd';
import { Resp } from '@/utils/request';
import { add, update } from '../service';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 16 },
};

export default () => {
  const { id, groupId } = useParams() as any;

  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: any) => {
    const hide = message.loading('正在添加');
    try {
      const data = await add(fields);
      hide();
      if (Resp.isOk(data)) {
        message.success('添加成功');
        return true;
      }
      return false;
    } catch (error) {
      hide();
      message.error('添加失败请重试！');
      return false;
    }
  };

  /**
   * 更新节点
   * @param fields
   */
  const handleUpdate = async (fields: any) => {
    const hide = message.loading('正在更新');
    try {
      const data = await update({
        id,
        ...fields,
      });
      hide();
      if (Resp.isOk(data)) {
        message.success('更新成功');
        return true;
      }
      return false;
    } catch (error) {
      hide();
      message.error('更新失败请重试！');
      return false;
    }
  };
  return (
    <PageHeaderWrapper
      title={groupId ? '添加接口' : '编辑接口'}
      content={
        <Button
          icon={<LeftOutlined />}
          onClick={() => {
            history.goBack();
          }}
        >
          返回
        </Button>
      }
    >
      <Form {...layout} onFinish={groupId ? handleAdd : handleUpdate}>
        <Form.Item
          label="接口地址"
          name="path"
          rules={[{ required: true, message: '请输入接口地址' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </PageHeaderWrapper>
  );
};

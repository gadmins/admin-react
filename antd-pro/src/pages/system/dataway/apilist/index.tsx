import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { TableListItem } from '@/pages/data';
import { Button, Dropdown, Menu, Modal, message } from 'antd';
import { useParams } from 'dva';
import { LeftOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { queryList, remove } from './service';

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TableListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    const data = await remove(selectedRows.map((row) => row.id));
    hide();
    if (data && data.code === 0) {
      message.success('删除成功，即将刷新');
      return true;
    }
    return false;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

export default () => {
  const { groupId } = useParams() as any;
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 64,
    },
  ];

  return (
    <PageHeaderWrapper
      title="接口列表"
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
      <ProTable<TableListItem>
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 1600 }}
        rowSelection={{}}
        toolBarRender={(action, { selectedRows }) => [
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              history.push(`/system/dataway/addapi/${groupId}`);
            }}
          >
            新建
          </Button>,
          selectedRows && selectedRows.length > 0 && (
            <Dropdown
              overlay={
                <Menu
                  onClick={async (e) => {
                    if (e.key === 'remove') {
                      Modal.confirm({
                        title: '确定要删除这些字典?',
                        content: '删除提示',
                        onOk() {
                          handleRemove(selectedRows).then(() => {
                            action.reload();
                          });
                        },
                      });
                    }
                  }}
                  selectedKeys={[]}
                >
                  <Menu.Item key="remove">批量删除</Menu.Item>
                </Menu>
              }
            >
              <Button>
                批量操作 <DownOutlined />
              </Button>
            </Dropdown>
          ),
        ]}
        request={async (params: any) => {
          const query = { ...params };
          query.groupId = groupId;
          if (query.createdAt) {
            query.createdAt = params.createdAt.map((it: string) => it.split(' ')[0]);
            query.createdAt[0] += ' 00:00:00';
            query.createdAt[1] += ' 23:59:59';
          }
          const data = await queryList(query);
          return data.data;
        }}
        columns={columns}
      />
    </PageHeaderWrapper>
  );
};

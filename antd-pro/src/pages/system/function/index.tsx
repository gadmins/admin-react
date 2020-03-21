import { SyncOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, { useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { history } from 'umi';
import { TableListItem } from '@/pages/data';
import { Resp } from '@/utils/request';
import { queryList, refresh } from './service';

const TableList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 85,
    },
    {
      title: '功能编码',
      dataIndex: 'code',
    },
    {
      title: '功能描述',
      dataIndex: 'title',
    },
    {
      title: '页面路由',
      dataIndex: 'frontUrl',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      valueType: 'dateRange',
      hideInForm: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              history.push({
                pathname: `/system/function/list`,
                state: {
                  funcId: record.funcId,
                  pid: record.id,
                },
              });
            }}
          >
            查看功能点
          </a>
        </>
      ),
    },
  ];

  return (
    <PageHeaderWrapper title="功能组管理">
      <ProTable<TableListItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolBarRender={() => [
          <Button
            icon={<SyncOutlined />}
            type="primary"
            onClick={() => {
              refresh().then(data => {
                if (Resp.isOk(data)) {
                  message.success('刷新成功');
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                }
              });
            }}
          >
            同步
          </Button>,
        ]}
        request={async params => {
          const data = await queryList(params);
          return data.data;
        }}
        columns={columns}
      />
    </PageHeaderWrapper>
  );
};

export default TableList;

import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useRef } from 'react';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { TableListItem } from '@/pages/data';
import { Button } from 'antd';
import { useParams, history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';

import { queryList } from './service';

export default () => {
  const { name } = useParams() as any;

  const actionRef = useRef<ActionType>();
  const [selectRecord, setSelectRecord] = useState<any | undefined>(undefined);

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 64,
    },
    {
      title: '字段名',
      dataIndex: 'COLUMN_NAME',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'COLUMN_TYPE',
    },
    {
      title: '是否为空',
      dataIndex: 'IS_NULLABLE',
    },
    {
      title: '键',
      dataIndex: 'COLUMN_KEY',
    },
    {
      title: '注释',
      dataIndex: 'COLUMN_COMMENT',
      key: 'comment',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              // handleUpdateModalVisible(true);
              setSelectRecord(record);
              console.log(selectRecord);
            }}
          >
            编辑
          </a>
        </>
      ),
    },
  ];
  return (
    <PageHeaderWrapper
      title="表结构"
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
        headerTitle={`表结构 - ${name}`}
        actionRef={actionRef}
        rowKey="COLUMN_NAME"
        rowSelection={{}}
        request={async (params: any) => {
          const query = { ...params };
          query.name = name;
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

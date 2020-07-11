import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useRef, useEffect } from 'react';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { TableListItem } from '@/pages/data';
import { Button } from 'antd';
import { useParams, history } from 'umi';
import { LeftOutlined } from '@ant-design/icons';

import { Resp } from '@/utils/request';
import { queryList } from './service';
import { queryList as fetchStruct } from '../struct/service';

export default () => {
  const { name } = useParams() as any;
  const actionRef = useRef<ActionType>();
  const [columns, setColumns] = useState<ProColumns<TableListItem>[]>([]);

  useEffect(() => {
    fetchStruct({
      currentPage: 0,
      pageSize: 100,
      tableName: name,
    }).then((result) => {
      if (Resp.isOk(result)) {
        const {
          data: { data = [] },
        } = result;
        const colms: ProColumns<TableListItem>[] = [];
        data.forEach((it: any) => {
          const col: ProColumns<TableListItem> = {
            title: it.COLUMN_NAME, // + (it.COLUMN_COMMENT ? `\n-${it.COLUMN_COMMENT}` : ''),
            dataIndex: it.COLUMN_NAME,
            hideInSearch: true,
          };
          if (col.dataIndex === 'id') {
            // col.valueType = 'indexBorder';
            col.width = 64;
            col.fixed = 'left';
            col.hideInSearch = false;
          } else if (col.dataIndex === 'enable') {
            col.render = (txt) => (txt ? '是' : '否');
          }
          colms.push(col);
        });
        colms.push({
          dataIndex: 'option',
          valueType: 'option',
          fixed: 'right',
          width: 100,
        });
        setColumns(colms);
      }
    });
  }, []);

  return (
    <PageHeaderWrapper
      title="表数据"
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
        headerTitle={`表数据 - ${name}`}
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 1550 }}
        rowSelection={{}}
        request={async (params: any) => {
          const query = { ...params };
          query.tableName = name;
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

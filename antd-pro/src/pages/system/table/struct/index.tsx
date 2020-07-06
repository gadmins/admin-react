import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useRef } from 'react';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { TableListItem } from '@/pages/data';
import { Button, Modal, message } from 'antd';
import { useParams, history } from 'umi';
import { LeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { Resp } from '@/utils/request';
import { queryList, remove, update, add } from './service';
import Edit from './components/Edit';

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
    message.warn(data.msg);
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
    const data = await update(fields);
    hide();
    if (Resp.isOk(data)) {
      message.success('更新成功');
      return true;
    }
    message.warn(data.msg);
    return false;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

export default () => {
  const { name } = useParams() as any;

  const actionRef = useRef<ActionType>();

  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [selectRecord, setSelectRecord] = useState<any | undefined>(undefined);

  const editColumn = (record: any) => {
    const sIdx = record.COLUMN_TYPE.indexOf('(');
    const eIdx = record.COLUMN_TYPE.indexOf(')');
    const valueLength =
      sIdx > -1 ? parseInt(record.COLUMN_TYPE.substring(sIdx + 1, eIdx), 10) : undefined;
    setSelectRecord({
      id: record.id,
      columnName: record.COLUMN_NAME,
      columnType: record.DATA_TYPE,
      unsigned: record.DATA_TYPE === 'int' && record.COLUMN_TYPE.includes('unsigned'),
      valueLength,
      isNull: record.IS_NULLABLE === 'YES',
      defValue: record.COLUMN_DEFAULT,
      columnComment: record.COLUMN_COMMENT,
    });
    handleModalVisible(true);
  };

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
      key: 'columnName',
      formItemProps: {
        allowClear: true,
      },
    },
    {
      title: '类型',
      dataIndex: 'COLUMN_TYPE',
      hideInSearch: true,
    },
    {
      title: '是否为空',
      dataIndex: 'IS_NULLABLE',
      hideInSearch: true,
    },
    {
      title: '默认值',
      dataIndex: 'COLUMN_DEFAULT',
      hideInSearch: true,
    },
    {
      title: '键',
      dataIndex: 'COLUMN_KEY',
      hideInSearch: true,
    },
    {
      title: '注释',
      dataIndex: 'COLUMN_COMMENT',
      hideInSearch: true,
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
              editColumn(record);
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
        toolBarRender={(action, { selectedRows }) => [
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setSelectRecord(undefined);
              handleModalVisible(true);
            }}
          >
            添加
          </Button>,
          selectedRows && selectedRows.length > 0 && (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: '删除提示',
                  content: '删除不可恢复，确定要删除?',
                  onOk() {
                    remove({
                      tableName: name,
                      columnName: selectedRows.map((it) => it.COLUMN_NAME).join(','),
                    }).then(() => {
                      action.reload();
                    });
                  },
                });
              }}
            >
              批量删除
            </Button>
          ),
        ]}
      />
      {modalVisible && (
        <Edit
          initVals={selectRecord}
          modalVisible={modalVisible}
          onSubmit={async (formValues: any) => {
            let success = false;
            if (formValues.oldColumnName) {
              success = await handleUpdate({
                ...formValues,
                tableName: name,
              });
            } else {
              success = await handleAdd({
                ...formValues,
                tableName: name,
              });
            }
            if (success) {
              setSelectRecord(undefined);
              setTimeout(() => {
                handleModalVisible(false);
                if (actionRef.current) {
                  actionRef.current.reload();
                }
              }, 0);
            }
            return success;
          }}
          onCancel={() => {
            setSelectRecord(undefined);
            setTimeout(() => {
              handleModalVisible(false);
            }, 0);
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};

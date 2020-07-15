import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState, useRef } from 'react';
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table';
import { TableListItem } from '@/pages/data';
import { Divider, message, Button, Dropdown, Menu, Modal } from 'antd';
import { history } from 'umi';
import { Resp } from '@/utils/request';
import { PlusOutlined, DownOutlined } from '@ant-design/icons';
import AuthorizedBtn from '@/components/Authorized/AuthorizedBtn';
import { useAuthorizedBtn } from '@/hooks/custom';
import { queryList, add, update, remove } from './service';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

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

/**
 *  删除节点
 * @param selectedRows
 */
const handleRemove = async (selectedRows: TableListItem[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    const data = await remove(selectedRows.map((row) => row.TABLE_NAME));
    hide();
    if (Resp.isOk(data)) {
      message.success('删除成功，即将刷新');
      return true;
    }
    message.warn(data.msg);
    return false;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

export default () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [selectRecord, setSelectRecord] = useState<any | undefined>(undefined);

  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 64,
    },
    {
      title: '表名',
      dataIndex: 'TABLE_NAME',
      key: 'tableName',
      order: 2,
      formItemProps: {
        allowClear: true,
      },
    },
    {
      title: '行',
      dataIndex: 'TABLE_ROWS',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'CREATE_TIME',
      valueType: 'dateRange',
      key: 'createdAt',
    },
    {
      title: '注释',
      dataIndex: 'TABLE_COMMENT',
      key: 'comment',
      order: 1,
      formItemProps: {
        allowClear: true,
      },
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <>
          <AuthorizedBtn code="sys:table:update">
            <a
              onClick={() => {
                handleUpdateModalVisible(true);
                setSelectRecord({
                  name: record.TABLE_NAME,
                  comment: record.TABLE_COMMENT,
                });
              }}
            >
              编辑
            </a>
          </AuthorizedBtn>
          <AuthorizedBtn code="sys:table:column:list">
            <Divider type="vertical" />
            <a
              onClick={() => {
                history.push(`/system/table/struct/${record.TABLE_NAME}`);
              }}
            >
              结构
            </a>
          </AuthorizedBtn>
          <AuthorizedBtn code="sys:table:data:list">
            <Divider type="vertical" />
            <a
              onClick={() => {
                history.push(`/system/table/data/${record.TABLE_NAME}`);
              }}
            >
              数据
            </a>
          </AuthorizedBtn>
          {/* <Divider type="vertical" />
          <a onClick={() => {}}>查看DDL</a> */}
        </>
      ),
    },
  ];
  const hasNew = useAuthorizedBtn('sys:table:add');
  const hasDel = useAuthorizedBtn('sys:table:del');
  return (
    <PageHeaderWrapper>
      <ProTable<TableListItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="TABLE_NAME"
        rowSelection={{}}
        toolBarRender={(action, { selectedRows }) => [
          hasNew && (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setSelectRecord(undefined);
                handleModalVisible(true);
              }}
            >
              新建
            </Button>
          ),
          selectedRows && selectedRows.length > 0 && (
            <Dropdown
              overlay={
                <Menu
                  onClick={async (e) => {
                    if (e.key === 'remove') {
                      Modal.confirm({
                        title: '删除提示',
                        content: '确定要删除这些表?',
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
                  {hasDel && <Menu.Item key="remove">批量删除</Menu.Item>}
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
      {createModalVisible && (
        <CreateForm
          initVals={selectRecord}
          modalVisible={createModalVisible}
          onSubmit={async (value) => {
            const success = await handleAdd(value);
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
      {updateModalVisible && (
        <UpdateForm
          initVals={selectRecord}
          modalVisible={updateModalVisible}
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
            return success;
          }}
          onCancel={() => {
            setSelectRecord(undefined);
            setTimeout(() => {
              handleUpdateModalVisible(false);
            }, 0);
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};

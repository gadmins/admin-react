import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Divider, message, Modal } from 'antd';
import React, { useState, useRef } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { TableListItem } from '@/pages/data';
import AuthorizedBtn from '@/components/Authorized/AuthorizedBtn';
import { Resp } from '@/utils/request';
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
    const data = await remove(selectedRows.map((row) => row.id));
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

const TableList: React.FC<{}> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);
  const [selectRecord, setSelectRecord] = useState<any | undefined>(undefined);

  const actionRef = useRef<ActionType>();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 64,
    },
    {
      title: '角色名',
      dataIndex: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'rcode',
      hideInSearch: true,
    },
    {
      title: '角色描述',
      dataIndex: 'rdesc',
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
          <AuthorizedBtn code="sys:role:edit">
            <a
              onClick={() => {
                handleUpdateModalVisible(true);
                setSelectRecord(record);
              }}
            >
              编辑
            </a>
            <Divider type="vertical" />
          </AuthorizedBtn>
          <AuthorizedBtn code="sys:role:copy">
            <a
              onClick={() => {
                setSelectRecord(record);
                handleModalVisible(true);
              }}
            >
              复制
            </a>
          </AuthorizedBtn>
        </>
      ),
    },
  ];

  const hasAdd = useAuthorizedBtn('sys:role:add');
  const hasDel = useAuthorizedBtn('sys:role:del');
  return (
    <PageHeaderWrapper>
      <ProTable<TableListItem>
        headerTitle="查询表格"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={(action, { selectedRows }) => [
          hasAdd && (
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
          selectedRows && selectedRows.length > 0 && hasDel && (
            <Dropdown
              overlay={
                <Menu
                  onClick={async (e) => {
                    if (e.key === 'remove') {
                      Modal.confirm({
                        title: '删除提示',
                        content: '删除角色将导致用户角色权限失效，确定要删除这些角色?',
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
          if (query.createdAt) {
            query.createdAt = params.createdAt.map((it: string) => it.split(' ')[0]);
            query.createdAt[0] += ' 00:00:00';
            query.createdAt[1] += ' 23:59:59';
          }
          const data = await queryList(query);
          return data.data;
        }}
        columns={columns}
        rowSelection={{}}
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

export default TableList;

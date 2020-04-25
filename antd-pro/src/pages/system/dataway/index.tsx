import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Divider, message, Modal } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { history } from 'umi';
import { TableListItem } from '@/pages/data';
import { Resp } from '@/utils/request';
import { groupOptions, queryList, add, update, remove } from './service';
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
    if (data && data.code === 0) {
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

  const [groupTypes, setGroupTypes] = useState({});

  const actionRef = useRef<ActionType>();
  const columns: ProColumns<TableListItem>[] = [
    {
      title: '序号',
      dataIndex: 'id',
      valueType: 'indexBorder',
      width: 64,
    },
    {
      title: '分组类型',
      dataIndex: 'groupType',
      valueEnum: groupTypes,
      formItemProps: {
        allowClear: true,
      },
    },
    {
      title: '分组描述',
      dataIndex: 'desc',
      hideInSearch: true,
    },
    {
      title: 'URL前缀',
      dataIndex: 'urlPrefix',
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
              handleUpdateModalVisible(true);
              setSelectRecord(record);
            }}
          >
            编辑
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              setSelectRecord(record);
              handleModalVisible(true);
            }}
          >
            复制
          </a>
          <Divider type="vertical" />
          <a
            onClick={() => {
              history.push(`/system/dataway/${record.id}/apilist`);
            }}
          >
            接口列表
          </a>
        </>
      ),
    },
  ];

  useEffect(() => {
    groupOptions().then((data) => {
      if (Resp.isOk(data)) {
        const types = {};
        data.data.forEach((it: any) => {
          types[it.type] = {
            text: it.label,
          };
        });
        setGroupTypes(types);
      }
    });
  }, []);

  return (
    <PageHeaderWrapper title="分组管理">
      <ProTable<TableListItem>
        headerTitle="分组列表"
        actionRef={actionRef}
        rowKey="id"
        toolBarRender={(action, { selectedRows }) => [
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => {
              setSelectRecord(undefined);
              handleModalVisible(true);
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

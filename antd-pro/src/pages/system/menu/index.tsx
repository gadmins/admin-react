import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { Tree, Button, Input, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { PlusOutlined, CopyOutlined, MinusOutlined } from '@ant-design/icons';
import styles from './index.less';
import { getMenuTree, updateMenu, addMenu, deleteMenus } from './service';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';

const { TreeNode } = Tree;
const { Search } = Input;

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async fields => {
  if (fields.errors) {
    return false;
  }
  const hide = message.loading('正在添加');
  try {
    const data = await addMenu(fields);
    hide();
    if (data && data.code === 200) {
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

const loopKeys = (data: any[]) => {
  let exKeys: string[] = [];
  data.forEach((item: any) => {
    if (item.children && item.children.length) {
      exKeys.push(item.key);
      const kk = loopKeys(item.children);
      if (kk && kk.length) {
        exKeys = exKeys.concat(kk);
      }
    }
  });
  return exKeys;
};

const findSearchTxtLength = (data: any[], value: string) => {
  let len = 0;
  data.forEach((item: any) => {
    const index = item.title.indexOf(value);
    if (index > -1) {
      len += 1;
    }
    if (item.children && item.children.length) {
      len += findSearchTxtLength(item.children, value);
    }
  });
  return len;
};

export default () => {
  const [menuTree, setMenuTree] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  const [menuIds, setMenuIds] = useState<number[]>([]);

  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [copyModalVisible, handleCopyModalVisible] = useState<boolean>(false);

  const [selectMenu, setSelectMenu] = useState(undefined);

  const [copyMenu, setCopyMenu] = useState(undefined);

  const loadMenuTree = () => {
    getMenuTree().then(data => {
      if (data && data.data) {
        setMenuTree(data.data);
        setTimeout(() => {
          const keys = loopKeys(data.data);
          setExpandedKeys(keys);
        }, 10);
      }
    });
  };

  const delMenus = async (ids: number[]) => {
    const hide = message.loading('正在删除');
    try {
      await deleteMenus(ids);
      hide();
      setCheckedKeys([]);
      if (selectMenu && ids.includes(selectMenu.id)) {
        setSelectMenu(undefined);
      }
      loadMenuTree();
      message.success('删除成功');
    } catch (error) {
      hide();
      message.error('删除失败请重试！');
    }
  };

  useEffect(() => {
    loadMenuTree();
  }, []);

  const loop = (data: any) =>
    data.map((item: any) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span style={{ color: '#f50' }}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children && item.children.length) {
        return (
          <TreeNode key={item.key} title={title} bind={item}>
            {loop(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} title={title} bind={item} />;
    });

  const onSearchChange = e => {
    const { value } = e.target;
    setSearchValue(value);
    if (value === '') {
      const keys = loopKeys(menuTree);
      setExpandedKeys(keys);
    } else if (findSearchTxtLength(menuTree, value) > 0) {
      const keys = loopKeys(menuTree);
      setExpandedKeys(keys);
    } else {
      setExpandedKeys([]);
    }
  };

  const toolbarDom = (props: { checkedKeys: any; selectMenu: any }) => (
    <>
      <Button
        icon={<PlusOutlined />}
        onClick={() => {
          handleModalVisible(true);
        }}
      >
        添加菜单
      </Button>
      {selectMenu && (
        <Button
          icon={<CopyOutlined />}
          onClick={() => {
            setCopyMenu(undefined);
            setTimeout(() => {
              setCopyMenu(props.selectMenu);
              handleCopyModalVisible(true);
            }, 0);
          }}
        >
          复制菜单
        </Button>
      )}
      {props.checkedKeys && props.checkedKeys.length > 0 && (
        <Button
          icon={<MinusOutlined />}
          onClick={async () => {
            Modal.confirm({
              title: '确定要删除这些菜单?',
              content: '删除提示',
              onOk() {
                delMenus(menuIds);
              },
            });
          }}
        >
          批量删除
        </Button>
      )}
    </>
  );

  const leftGridDom = () => (
    <div className={styles.leftMenu}>
      <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onSearchChange} />
      <Tree
        showLine
        blockNode
        checkable
        expandedKeys={expandedKeys}
        checkedKeys={checkedKeys}
        onCheck={(keys, { checkedNodes }) => {
          setCheckedKeys(keys);
          const ids = checkedNodes?.map(it => it.bind.id);
          // eslint-disable-next-line no-unused-expressions
          ids && setMenuIds(ids);
        }}
        onSelect={(keys, { node }) => {
          if (keys.length > 0) {
            setSelectMenu(undefined);
            setTimeout(() => {
              setSelectMenu(node.bind);
            }, 0);
          } else {
            setSelectMenu(undefined);
          }
        }}
      >
        {loop(menuTree)}
      </Tree>
    </div>
  );
  return (
    <PageHeaderWrapper>
      <div className={styles.main}>
        <div className={styles.toolbar}>
          {toolbarDom({
            checkedKeys,
            selectMenu,
          })}
        </div>
        <GridContent>
          <div className={styles.grid}>
            {leftGridDom()}
            <div className={styles.right}>
              {selectMenu && (
                <UpdateForm
                  onSubmit={(formVals: FormValueType) => {
                    updateMenu(formVals).then(data => {
                      if (data && data.code === 200) {
                        message.success('修改成功');
                        loadMenuTree();
                      } else {
                        message.error(data.msg);
                      }
                    });
                  }}
                  values={selectMenu}
                />
              )}
            </div>
          </div>
        </GridContent>
      </div>
      <CreateForm
        onSubmit={async value => {
          const success = await handleAdd(value);
          if (success) {
            handleModalVisible(false);
            loadMenuTree();
          }
        }}
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      />
      {copyMenu && (
        <CreateForm
          formVals={copyMenu}
          onSubmit={async value => {
            const success = await handleAdd(value);
            if (success) {
              handleCopyModalVisible(false);
              loadMenuTree();
            }
          }}
          onCancel={() => handleCopyModalVisible(false)}
          modalVisible={copyModalVisible}
        />
      )}
    </PageHeaderWrapper>
  );
};

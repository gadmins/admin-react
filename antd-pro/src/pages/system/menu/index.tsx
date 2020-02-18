import { PageHeaderWrapper, GridContent } from '@ant-design/pro-layout';
import { Tree, Button, Input, Modal, message } from 'antd';
import React, { useState, useEffect } from 'react';
import styles from './index.less';
import { getMenuTree } from './service';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/UpdateForm';

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
  console.log(fields);
  const hide = message.loading('正在添加');
  try {
    hide();
    message.success('添加成功');
    return true;
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
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [menuTree, setMenuTree] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');

  const [menuIds, setMenuIds] = useState<number[]>([]);

  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  const [selectMenu, setSelectMenu] = useState(undefined);

  const [copyMenu, setCopyMenu] = useState(undefined);

  let updateRef: { updateFormVals: (arg0: any) => void } | null = null;

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
    console.log('delMenus', ids);
    loadMenuTree();
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
        icon="plus"
        onClick={() => {
          setCopyMenu(null);
          handleModalVisible(true);
        }}
      >
        添加菜单
      </Button>
      {selectMenu && (
        <Button
          icon="plus"
          onClick={() => {
            setCopyMenu(props.selectMenu);
            handleModalVisible(true);
          }}
        >
          复制菜单
        </Button>
      )}
      {props.checkedKeys && props.checkedKeys.length > 0 && (
        <Button
          icon="minus"
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
          const ids = checkedNodes?.map(it => it.props.bind.id);
          // eslint-disable-next-line no-unused-expressions
          ids && setMenuIds(ids);
        }}
        onSelect={(_, { node }) => {
          if (updateRef) {
            updateRef.updateFormVals(node.props.bind);
          }
          setSelectMenu(node.props.bind);
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
                  wrappedComponentRef={(form: { updateFormVals: (arg0: any) => void } | null) => {
                    updateRef = form;
                  }}
                  values={selectMenu}
                />
              )}
            </div>
          </div>
        </GridContent>
      </div>
      <CreateForm
        formVals={copyMenu}
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
    </PageHeaderWrapper>
  );
};

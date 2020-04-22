import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { useParams } from 'dva';
import { history } from 'umi';
import AceEditor from 'react-ace';
import ReactJson from 'react-json-view';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import { LeftOutlined } from '@ant-design/icons';
import { Button, message, Form, Input, Card, Radio, Tabs, Divider, Popconfirm } from 'antd';
import copy from 'copy-to-clipboard';
import { Resp } from '@/utils/request';
import { add, update, getById, publish, testScript, offline } from '../service';
import { getById as getGroupById } from '../../service';
import styles from './index.less';

const { TextArea } = Input;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

export default () => {
  const { id, groupId } = useParams() as any;

  const [form] = Form.useForm();

  const [reload, setReload] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [testData, setTestData] = useState<any | undefined>(undefined);

  const [urlPrefix, setUrlPrefix] = useState('');
  const [aceType, setAceType] = useState('javascript');
  const [aceFontSize, setAceFontSize] = useState(15);
  const [formInit, setFormInit] = useState<any>({
    apiMethod: 'GET',
    scriptType: 'DataQL',
    apiScript: 'var t;',
  });

  if (id) {
    useEffect(() => {
      getById(id)
        .then((data) => {
          if (Resp.isOk(data)) {
            return Promise.resolve(data.data);
          }
          return Promise.reject();
        })
        .then((data) => {
          if (data && data.groupId) {
            if (data.scriptType === 'DataQL') {
              setAceType('javascript');
            } else {
              setAceType('sql');
            }
            getGroupById(data.groupId).then((group) => {
              if (Resp.isOk(group)) {
                const prefix: string = group.data.urlPrefix;
                const url = prefix.endsWith('/') ? prefix : `${prefix}/`;
                setUrlPrefix(url);
                const apiPath = data.apiPath.replace(url, '');
                const formVals = {
                  ...data,
                  apiPath,
                };
                form.setFieldsValue(formVals);
                setFormInit(formVals);
              }
            });
          }
        });
    }, [reload]);
  }
  if (groupId) {
    useEffect(() => {
      getGroupById(groupId).then((data) => {
        if (Resp.isOk(data)) {
          const prefix: string = data.data.urlPrefix;
          const url = prefix.endsWith('/') ? prefix : `${prefix}/`;
          setUrlPrefix(url);
        }
      });
    }, []);
  }

  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: any) => {
    if (errorMsg) {
      message.warn('脚本测试未通过，请检查脚本');
      return;
    }
    if (!testData) {
      message.warn('脚本未测试，请测试');
      return;
    }
    const hide = message.loading('正在添加');
    const params: any = { ...fields };
    try {
      params.groupId = groupId;
      params.apiPath = urlPrefix + params.apiPath;
      params.apiReqSchema = JSON.stringify({});
      params.apiRespSchema = JSON.stringify({});
      const data = await add(params);
      hide();
      if (Resp.isOk(data)) {
        message.success('添加成功');
        setReload(!reload);
      }
    } catch (error) {
      hide();
      message.error('添加失败请重试！');
    }
  };

  /**
   * 更新节点
   * @param fields
   */
  const handleUpdate = async (fields: any) => {
    if (errorMsg) {
      message.warn('脚本测试未通过，请检查脚本');
      return;
    }
    if (!testData) {
      message.warn('脚本未测试，请测试');
      return;
    }
    const hide = message.loading('正在更新');
    const params: any = { ...fields };
    try {
      params.groupId = groupId;
      params.apiPath = urlPrefix + params.apiPath;
      params.apiReqSchema = JSON.stringify({});
      params.apiRespSchema = JSON.stringify({});
      const data = await update({
        id,
        ...params,
      });
      hide();
      if (Resp.isOk(data)) {
        message.success('更新成功');
        setReload(!reload);
      }
    } catch (error) {
      hide();
      message.error('更新失败请重试！');
    }
  };

  /**
   * 发布
   */
  const handlePublish = async () => {
    if (!id) {
      return;
    }
    const hide = message.loading('正在发布');
    try {
      const data = await publish(id);
      hide();
      if (Resp.isOk(data)) {
        message.success('发布成功');
        setReload(!reload);
      }
    } catch (error) {
      hide();
      message.error('发布失败请重试！');
    }
  };

  /**
   * 下线
   */
  const handleOffline = async () => {
    if (!id) {
      return;
    }
    const hide = message.loading('正在下线');
    try {
      const data = await offline(id);
      hide();
      if (Resp.isOk(data)) {
        message.success('下线成功');
        setReload(!reload);
      }
    } catch (error) {
      hide();
      message.error('发布失败请重试！');
    }
  };

  const handleTest = async () => {
    try {
      const type = form.getFieldValue('scriptType');
      const script = form.getFieldValue('apiScript');
      const data = await testScript({
        type,
        script,
      });
      if (Resp.isOk(data)) {
        setTestData(data.data);
        setErrorMsg(undefined);
      } else {
        setTestData(undefined);
        setErrorMsg(data.msg || 'error');
      }
    } catch (error) {
      setErrorMsg(error.msg || 'error');
    }
  };

  return (
    <PageHeaderWrapper
      title={groupId ? '添加接口' : '编辑接口'}
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
      <Form
        {...layout}
        form={form}
        initialValues={formInit}
        onFinish={groupId ? handleAdd : handleUpdate}
      >
        <div className={styles.form}>
          <div className={styles.toolbar}>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={formInit.status === 1}>
                保存
              </Button>
              {id && formInit.status === 0 && (
                <Button
                  style={{ marginLeft: 10 }}
                  onClick={() => {
                    form.resetFields();
                  }}
                >
                  重置
                </Button>
              )}
              <Divider type="vertical" />
              {id && formInit.status === 0 && (
                <Popconfirm
                  title="确定要上线?"
                  onConfirm={handlePublish}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button>发布</Button>
                </Popconfirm>
              )}
              {id && formInit.status === 1 && (
                <Popconfirm
                  title="确定要下线?"
                  onConfirm={handleOffline}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button>下线</Button>
                </Popconfirm>
              )}
            </Form.Item>
          </div>
          <Card title="基本信息">
            <Form.Item
              label="请求方法"
              name="apiMethod"
              rules={[{ required: true, message: '请选择' }]}
            >
              <Radio.Group>
                <Radio.Button value="GET">GET</Radio.Button>
                <Radio.Button value="POST">POST</Radio.Button>
                <Radio.Button value="PUT">PUT</Radio.Button>
                <Radio.Button value="DELETE">DELETE</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="接口地址"
              name="apiPath"
              wrapperCol={{ span: 8 }}
              rules={[{ required: true, message: '请输入接口地址' }]}
            >
              <Input addonBefore={urlPrefix} />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }}>
              <Button
                type="link"
                onClick={() => {
                  const errors = form.getFieldError('apiPath');
                  if (!errors || errors.length === 0) {
                    copy(urlPrefix + form.getFieldValue('apiPath'));
                    message.success('复制成功');
                  }
                }}
              >
                复制
              </Button>
            </Form.Item>
            <Form.Item
              label="接口描述"
              name="apiComment"
              wrapperCol={{ span: 8 }}
              rules={[{ required: true, message: '请输入接口描述' }]}
            >
              <TextArea rows={3} maxLength={220} />
            </Form.Item>
          </Card>
          <Card title="脚本信息及测试" style={{ marginTop: 10 }}>
            <Form.Item
              label="脚本类型"
              name="scriptType"
              rules={[{ required: true, message: '请选择脚本类型' }]}
            >
              <Radio.Group
                onChange={(value) => {
                  if (value.target.value === 'DataQL') {
                    setAceType('javascript');
                  } else {
                    setAceType('sql');
                  }
                }}
              >
                <Radio.Button value="DataQL">DataQL</Radio.Button>
                <Radio.Button value="SQL">SQL</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }}>
              <div>
                字体：
                <Radio.Group
                  value={aceFontSize}
                  onChange={(value) => {
                    setAceFontSize(value.target.value);
                  }}
                >
                  <Radio.Button value={15}>15</Radio.Button>
                  <Radio.Button value={20}>20</Radio.Button>
                  <Radio.Button value={23}>23</Radio.Button>
                </Radio.Group>
              </div>
            </Form.Item>
            <Form.Item
              label="接口脚本"
              name="apiScript"
              wrapperCol={{ span: 8 }}
              rules={[{ required: true, message: '请输入接口脚本' }]}
            >
              <AceEditor
                mode={aceType}
                theme="monokai"
                width="800px"
                height="300px"
                fontSize={aceFontSize}
                editorProps={{ $blockScrolling: true }}
              />
            </Form.Item>
            {errorMsg && (
              <Form.Item wrapperCol={{ offset: 4 }}>
                <div className={styles.error}>{errorMsg}</div>
              </Form.Item>
            )}
            <Form.Item label="测试参数">
              <Tabs onChange={() => {}} type="card">
                <TabPane tab="参数" key="1">
                  参数
                </TabPane>
              </Tabs>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 4 }}>
              <Button onClick={handleTest}>测试</Button>
            </Form.Item>
          </Card>
          <Card title="请求响应" style={{ marginTop: 10 }}>
            {testData ? (
              <div>
                执行时间：{testData.executionTime}ms
                <Divider dashed />
                <ReactJson name={false} src={testData.data} />
              </div>
            ) : (
              <div>无</div>
            )}
          </Card>
        </div>
      </Form>
    </PageHeaderWrapper>
  );
};

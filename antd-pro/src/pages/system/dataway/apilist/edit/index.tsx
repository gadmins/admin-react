import React, { useState, useEffect } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { history, useParams } from 'umi';
import AceEditor from 'react-ace';
import ReactJson from 'react-json-view';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';
import { LeftOutlined, CopyOutlined } from '@ant-design/icons';
import {
  Button,
  message,
  Form,
  Input,
  Card,
  Radio,
  Tabs,
  Divider,
  Popconfirm,
  Row,
  Col,
  Switch,
} from 'antd';
import copy from 'copy-to-clipboard';
import { Resp } from '@/utils/request';
import IconFont from '@/components/IconFont';
import ParamTable from './components/ParamTable';
import { add, update, getById, publish, testScript, offline } from '../service';
import { getById as getGroupById } from '../../service';
import styles from './index.less';

const { TextArea } = Input;
const { TabPane } = Tabs;

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const matchPathVars = (path: string) => {
  const splitStart = '{';
  const splitEnd = '}';
  const keys = [];
  let findStart = false;
  let tempKey = '';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < path.length; i++) {
    const c = path[i];
    if (c === splitEnd) {
      keys.push(tempKey);
      tempKey = '';
      findStart = false;
    }
    if (findStart) {
      tempKey += c;
    }
    if (c === splitStart) {
      findStart = true;
    }
  }
  return keys.filter((it) => it !== '');
};

export default () => {
  const { id, groupId } = useParams() as any;

  const [form] = Form.useForm();

  const [reload, setReload] = useState(true);

  const [method, setMethod] = useState<string>('GET');
  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  const [testData, setTestData] = useState<any | undefined>(undefined);
  const [pathVars, setPathVars] = useState<any[]>([]);
  const [queryData, setQueryData] = useState<any[]>([]);
  const [bodyData, setBodyData] = useState<any[]>([]);

  const [urlPrefix, setUrlPrefix] = useState('');
  const [aceType, setAceType] = useState('javascript');
  const [aceFontSize, setAceFontSize] = useState(15);
  const [formInit, setFormInit] = useState<any>({
    apiMethod: 'GET',
    scriptType: 'DataQL',
    apiScript: '',
  });

  const changePathVars = (apiPath: string) => {
    const keys = matchPathVars(apiPath);
    if (keys.length > 0) {
      setPathVars([]);
      setTimeout(() => {
        setPathVars(
          keys.map((it, idx) => {
            return {
              key: `${idx}`,
              name: it,
              type: 'string',
              desc: it,
              def: '0',
            };
          }),
        );
      }, 1);
    } else {
      setPathVars([]);
    }
  };

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
                changePathVars(apiPath);
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
      params.apiReqSchema = JSON.stringify({
        path: pathVars,
        query: queryData,
        body: bodyData,
      });
      params.apiRespSchema = JSON.stringify({});
      const data = await add(params);
      hide();
      if (Resp.isOk(data)) {
        if (params.status === 1) {
          message.success('添加并发布成功');
        } else {
          message.success('添加成功');
        }
        history.goBack();
      } else {
        message.warn(data.msg);
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
      params.apiReqSchema = JSON.stringify({
        path: pathVars,
        query: queryData,
        body: bodyData,
      });
      params.apiRespSchema = JSON.stringify({});
      const data = await update({
        id,
        ...params,
      });
      hide();
      if (Resp.isOk(data)) {
        message.success('更新成功');
        setReload(!reload);
      } else {
        message.warn(data.msg);
      }
    } catch (error) {
      hide();
      message.error('更新失败请重试！');
    }
  };

  const handleAdd2Pub = async () => {
    try {
      const fields = await form.validateFields();
      fields.status = 1;
      await handleAdd(fields);
    } catch (error) {
      if (error.errorFields && error.errorFields.lengt > 0) {
        form.scrollToField(error.errorFields[0].name[0]);
      }
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
      } else {
        message.warn(data.msg);
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
      } else {
        message.warn(data.msg);
      }
    } catch (error) {
      hide();
      message.error('发布失败请重试！');
    }
  };

  const handleTest = async () => {
    try {
      const params = {};
      if (queryData.length > 0) {
        queryData.forEach((it) => {
          params[it.name] = it.def;
        });
      }
      if (bodyData.length > 0) {
        bodyData.forEach((it) => {
          params[it.name] = it.def;
        });
      }
      if (pathVars.length > 0) {
        pathVars.forEach((it) => {
          params[it.name] = it.def;
        });
      }
      const type = form.getFieldValue('scriptType');
      const script = form.getFieldValue('apiScript');
      const data = await testScript({
        type,
        script,
        params,
      });
      if (Resp.isOk(data)) {
        setTestData(data);
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
        onValuesChange={({ apiPath }) => {
          if (apiPath) {
            changePathVars(apiPath);
          }
        }}
        onFinish={groupId ? handleAdd : handleUpdate}
      >
        <div className={styles.form}>
          <div className={styles.toolbar}>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={formInit.status === 1}>
                {groupId ? '保存' : '修改'}
              </Button>
              {groupId && (
                <Button style={{ marginLeft: 10 }} onClick={handleAdd2Pub}>
                  保存并发布
                </Button>
              )}
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
                  <Button icon={<IconFont type="g-fabu" />}>发布</Button>
                </Popconfirm>
              )}
              {id && formInit.status === 1 && (
                <Popconfirm
                  title="确定要下线?"
                  onConfirm={handleOffline}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button icon={<IconFont type="g-xiajia" />}>下线</Button>
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
              <Radio.Group
                size="small"
                buttonStyle="solid"
                onChange={(e) => {
                  setMethod(e.target.value);
                }}
              >
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
              <Input
                addonBefore={urlPrefix}
                suffix={
                  <Button
                    type="link"
                    icon={<CopyOutlined />}
                    onClick={() => {
                      const errors = form.getFieldError('apiPath');
                      if (!errors || errors.length === 0) {
                        copy(urlPrefix + form.getFieldValue('apiPath'));
                        message.success('复制成功');
                      }
                    }}
                  />
                }
              />
            </Form.Item>
            {/* <Form.Item style={{ margin: 0, padding: 0 }} wrapperCol={{ offset: 4 }}>
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
            </Form.Item> */}
            <Form.Item
              label="接口描述"
              name="apiComment"
              wrapperCol={{ span: 8 }}
              rules={[{ required: true, message: '请输入接口描述' }]}
            >
              <TextArea rows={2} maxLength={220} />
            </Form.Item>
          </Card>
          <Card title="权限配置" style={{ marginTop: 10 }}>
            <Form.Item label="启用" name="auth">
              <Switch />
            </Form.Item>
          </Card>
          <Row>
            <Col span={17}>
              <Card title="脚本信息及测试" style={{ marginTop: 10 }}>
                <Form.Item
                  label="脚本类型"
                  name="scriptType"
                  rules={[{ required: true, message: '请选择脚本类型' }]}
                >
                  <Radio.Group
                    size="small"
                    buttonStyle="solid"
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
                    <TabPane tab="path" key="1">
                      {pathVars.length > 0 && (
                        <ParamTable
                          dataSource={pathVars}
                          onDataChange={(data) => {
                            setPathVars(data);
                          }}
                          addable={false}
                          deleteable={false}
                        />
                      )}
                    </TabPane>
                    {method === 'GET' && (
                      <TabPane tab="query" key="2">
                        <ParamTable
                          editable={{
                            name: true,
                            type: true,
                            desc: true,
                            def: true,
                          }}
                          dataSource={[]}
                          onDataChange={(data) => {
                            setQueryData(data);
                          }}
                        />
                      </TabPane>
                    )}
                    {(method === 'POST' || method === 'PUT') && (
                      <TabPane tab="body" key="3">
                        <ParamTable
                          editable={{
                            name: true,
                            type: true,
                            desc: true,
                            def: true,
                          }}
                          dataSource={[]}
                          onDataChange={(data) => {
                            setBodyData(data);
                          }}
                        />
                      </TabPane>
                    )}
                  </Tabs>
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 4 }}>
                  <Button onClick={handleTest}>测试</Button>
                </Form.Item>
              </Card>
            </Col>
            <Col span={7}>
              <Card title="请求响应" style={{ height: 680, marginLeft: 10, marginTop: 10 }}>
                {testData ? (
                  <div>
                    执行时间：{testData.executionTime}ms
                    <Divider dashed />
                    {typeof testData.data === 'object' && (
                      <>
                        <div>执行结果：</div>
                        <Divider dashed />
                        <ReactJson style={{ maxHeight: 600 }} name={false} src={testData.data} />
                      </>
                    )}
                    {typeof testData.data !== 'object' && <div>执行结果：{testData.data}</div>}
                  </div>
                ) : (
                  <div>无</div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Form>
    </PageHeaderWrapper>
  );
};

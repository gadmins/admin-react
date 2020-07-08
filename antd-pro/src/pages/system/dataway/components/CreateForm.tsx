import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { SchemaForm, createFormActions, ISchema } from '@formily/antd';
import { Resp, abortRequest } from '@/utils/request';
import { groupOptions } from '../service';

interface FormProps {
  modalVisible: boolean;
  initVals?: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
const actions = createFormActions();

export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;

  const [groupTypes, setGroupTypes] = useState<any[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState<string>('');

  function changeCurrentPrefix(e: string) {
    const idx = groupTypes.findIndex((it) => it.type === e);
    if (idx > -1) {
      const prefix: string = groupTypes[idx].urlPrefix;
      const url = prefix.endsWith('/') ? prefix : `${prefix}/`;
      setCurrentPrefix(url);
      return url;
    }
    setCurrentPrefix('');
    return '';
  }

  const initialValues = initVals
    ? {
        groupType: initVals.groupType,
        desc: initVals.desc,
      }
    : {};
  const schema: ISchema = {
    type: 'object',
    properties: {
      groupType: {
        type: 'string',
        title: '分组类型',
        required: true,
        enum: groupTypes.map((it) => ({
          value: it.type,
          label: it.label,
        })),
        'x-component-props': {
          allowClear: true,
          onChange: (e: string) => {
            changeCurrentPrefix(e);
          },
        },
      },
      desc: {
        type: 'string',
        title: '分组描述',
        required: true,
      },
      urlPrefix: {
        type: 'string',
        title: 'URL前缀',
        required: true,
        'x-component-props': {
          addonBefore: currentPrefix,
        },
      },
      hasMenu: {
        type: 'boolean',
        title: '菜单',
        'x-linkages': [
          {
            type: 'value:visible',
            target: 'menuCode',
            condition: '{{$value}}',
          },
          {
            type: 'value:visible',
            target: 'menuParentCode',
            condition: '{{$value}}',
          },
          {
            type: 'value:visible',
            target: 'menuTitle',
            condition: '{{$value}}',
          },
        ],
      },
      menuCode: {
        type: 'string',
        title: '菜单编码',
        required: true,
      },
      menuParentCode: {
        type: 'string',
        title: '菜单父级编码',
        required: true,
      },
      menuTitle: {
        type: 'string',
        title: '菜单标题',
        required: true,
      },
    },
  };
  useEffect(() => {
    groupOptions().then((data) => {
      if (Resp.isOk(data)) {
        setGroupTypes(data.data);
      }
    });
    return () => {
      abortRequest();
    };
  }, []);
  useEffect(() => {
    if (initVals && initVals.groupType && initVals.urlPrefix) {
      const url = changeCurrentPrefix(initVals.groupType);
      if (url && url !== '') {
        actions.setFieldValue('urlPrefix', initVals.urlPrefix.replace(url, ''));
      }
    }
    return () => {};
  }, [groupTypes]);

  const okHandle = async () => {
    try {
      await actions.validate();
      await actions.submit(async (values: any) => {
        const rs: boolean = await onSubmit({
          ...values,
          urlPrefix: currentPrefix + values.urlPrefix,
        });
        if (rs) {
          actions.reset();
        }
      });
      // eslint-disable-next-line no-empty
    } catch (error) {}
  };
  return (
    <Modal
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title={initVals ? '复制分组' : '创建分组'}
      onOk={okHandle}
      onCancel={() => {
        actions.reset();
        onCancel();
      }}
    >
      <SchemaForm initialValues={initialValues} schema={schema} actions={actions} {...formLayout} />
    </Modal>
  );
};

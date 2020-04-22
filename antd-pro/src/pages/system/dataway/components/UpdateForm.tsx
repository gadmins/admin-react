import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import SchemaForm, { useForm, createFormActions, ISchema } from '@formily/antd';
import { setup } from '@formily/antd-components';
import { Resp } from '@/utils/request';
import { groupOptions } from '../service';

interface FormProps {
  modalVisible: boolean;
  initVals: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};
setup();
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
  const form = useForm({
    value: initialValues,
    actions,
  });
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
    },
  };
  useEffect(() => {
    groupOptions().then((data) => {
      if (Resp.isOk(data)) {
        setGroupTypes(data.data);
      }
    });
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
      await form.validate();
      await form.submit(async (values: any) => {
        const rs: boolean = await onSubmit({
          ...values,
          urlPrefix: currentPrefix + values.urlPrefix,
          id: initVals.id,
        });
        if (rs) {
          form.reset();
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
      title="编辑分组"
      onOk={okHandle}
      onCancel={() => {
        form.reset();
        onCancel();
      }}
    >
      <SchemaForm schema={schema} form={form} {...formLayout} />
    </Modal>
  );
};

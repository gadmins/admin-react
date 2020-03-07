import React, { useState, useEffect } from 'react';
import { Modal, Tabs } from 'antd';
import AceEditor, { IAnnotation } from 'react-ace';
// import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
// import SchemaForm, { useForm, createFormActions, ISchema } from '@formily/antd';
// import { setup } from '@formily/antd-components';
import { querySchema } from '@/services/schema';
import ListTable from './ListTable';

const { TabPane } = Tabs;

interface FormProps {
  modalVisible: boolean;
  initVals: any;
  onSubmit: (fieldsValue: any) => Promise<boolean>;
  onCancel: () => void;
}
export default (props: React.PropsWithChildren<FormProps>) => {
  const { modalVisible, onSubmit, onCancel, initVals } = props;
  const initialValues = initVals || {};
  const METHOD = initialValues.apiMethod || 'GET';
  const [dataSrouce, setDataSrouce] = useState<any[]>([]);
  const [annotations, setAnnotations] = useState<IAnnotation[]>([]);
  const [jsonSchema, setJsonSchema] = useState<string>(
    METHOD === 'GET'
      ? `{
  "columns": []
}`
      : `{
  "type": "object",
  "properties": {
  }
}`,
  );

  if (initVals && initVals.id) {
    useEffect(() => {
      setDataSrouce([
        {
          key: '1',
          title: 'John',
          dataIndex: 'title',
          valueType: 'text',
          hideInTable: true,
          hideInSearch: true,
        },
        {
          key: '2',
          title: 'Brown',
          dataIndex: 'title',
          valueType: 'text',
          hideInTable: true,
          hideInSearch: true,
        },
        {
          key: '3',
          title: 'st',
          dataIndex: 'title',
          valueType: 'text',
          hideInTable: true,
          hideInSearch: true,
        },
      ]);
      querySchema(initVals.id).then(data => {
        if (data && data.data && data.data.commonSchema) {
          setJsonSchema(data.data.commonSchema);
        }
        // TODO: parse form
      });
    }, []);
  }
  const okHandle = async () => {
    try {
      setJsonSchema(JSON.stringify(JSON.parse(jsonSchema), null, 4));
      setAnnotations([]);
      await onSubmit({
        id: initVals.id,
        schema: jsonSchema,
      });
      // eslint-disable-next-line no-empty
    } catch (error) {
      setAnnotations([
        {
          row: 0,
          column: 1,
          text: 'json error',
          type: 'error',
        },
      ]);
    }
  };
  const onChange = (newVal: string) => {
    setJsonSchema(newVal);
  };

  return (
    <Modal
      width={900}
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title="配置Schema"
      onOk={okHandle}
      onCancel={() => {
        // form.reset();
        onCancel();
      }}
    >
      <Tabs type="card">
        <TabPane tab="Schema配置" key="1">
          <ListTable
            dataSrouce={dataSrouce}
            onDataChange={(data: any[]) => {
              setDataSrouce(data);
            }}
          />
        </TabPane>
        <TabPane tab="JSON手写" key="2">
          <AceEditor
            mode="json"
            theme="monokai"
            value={jsonSchema}
            onChange={onChange}
            annotations={annotations}
            width="650"
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

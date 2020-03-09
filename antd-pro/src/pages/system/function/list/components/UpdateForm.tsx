import React, { useState, useEffect } from 'react';
import { Modal, Tabs } from 'antd';
import AceEditor, { IAnnotation } from 'react-ace';
// import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import { querySchema } from '@/services/schema';
import ListTable from './ListTable';
import FormTable from './FormTable';

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
      querySchema(initVals.id).then(data => {
        if (data && data.data && data.data.dataSchema) {
          const schema = data.data.dataSchema;
          setJsonSchema(JSON.stringify(schema, null, 4));
          if (METHOD === 'GET') {
            setDataSrouce(
              schema.columns.map((s: any) => ({
                ...s,
                key: s.dataIndex,
              })),
            );
          } else if (schema.schema && schema.schema.properties) {
            const obj = schema.schema.properties;
            const pdata: any[] = [];
            Object.entries(obj).forEach(p => {
              const o = p[1] as any;
              pdata.push({
                key: p[0],
                type: 'string',
                ...o,
              });
            });
            setDataSrouce(pdata);
          }
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

  const onAddRow = () => {
    const data = [...dataSrouce];
    if (METHOD === 'GET') {
      data.push({
        key: `${data.length + 1}`,
        title: '标题',
        dataIndex: 'title',
        valueType: 'text',
      });
    } else {
      data.push({
        key: `${data.length + 1}`,
        title: '标题',
        name: 'name',
        type: 'string',
      });
    }
    setDataSrouce(data);
  };

  const onDeleteRow = (record: any) => {
    const index = dataSrouce.findIndex(item => record.key === item.key);
    if (index > -1) {
      const data = [...dataSrouce];
      data.splice(index, 1);
      setDataSrouce(data);
    }
  };

  return (
    <Modal
      width={1050}
      maskClosable={false}
      destroyOnClose
      visible={modalVisible}
      title="配置Schema"
      onOk={okHandle}
      onCancel={() => {
        onCancel();
      }}
    >
      <Tabs type="card">
        <TabPane tab="Schema配置" key="1">
          {METHOD === 'GET' && (
            <ListTable
              dataSrouce={dataSrouce}
              onDataChange={(data: any[]) => {
                setDataSrouce(data);
              }}
              onAddRow={onAddRow}
              onDeleteRow={onDeleteRow}
            />
          )}
          {METHOD !== 'GET' && (
            <FormTable
              dataSrouce={dataSrouce}
              onDataChange={(data: any[]) => {
                setDataSrouce(data);
              }}
              onAddRow={onAddRow}
              onDeleteRow={onDeleteRow}
            />
          )}
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

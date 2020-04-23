import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

const EditableContext = React.createContext<any>({});

interface Item {
  key: string;
  name: string;
  age: string;
  address: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef();
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} 不能为空.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

interface ParamItem {
  key: string;
  name: string;
  type: string;
  desc: string;
  def: string;
}

interface ParamTableProps {
  deleteable?: boolean;
  addable?: boolean;
  editable?: {
    name: boolean;
    type: boolean;
    desc: boolean;
    def: boolean;
  };
  dataSource: ParamItem[];
  onDataChange: (record: ParamItem[]) => void;
}

class EditableTable extends React.Component<ParamTableProps> {
  columns: any[];

  constructor(props: ParamTableProps) {
    super(props);
    const { editable, dataSource } = props;
    this.columns = [
      {
        title: '参数名称',
        dataIndex: 'name',
        width: 100,
        editable: editable ? editable.name : false,
      },
      {
        title: '数据类型',
        dataIndex: 'type',
        editable: editable ? editable.type : true,
      },
      {
        title: '参数说明',
        dataIndex: 'desc',
        editable: editable ? editable.desc : true,
      },
      {
        title: '默认值',
        dataIndex: 'def',
        editable: editable ? editable.def : true,
      },
    ];

    if (props.deleteable !== false) {
      this.columns.push({
        title: '操作',
        dataIndex: 'operation',
        render: (_: any, record: any) =>
          this.state.dataSource.length >= 1 ? (
            <Popconfirm title="确认删除?" onConfirm={() => this.handleDelete(record.key)}>
              <a>
                <MinusOutlined />
              </a>
            </Popconfirm>
          ) : null,
      });
    }

    this.state = {
      dataSource: [...dataSource],
      count: dataSource.length,
    };
  }

  handleDelete = (key: string) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const dataSource = [...this.state.dataSource].filter((item) => item.key !== key);
    this.setState({ dataSource });
    this.props.onDataChange(this.state.dataSource);
  };

  handleAdd = () => {
    const { count, dataSource } = this.state;
    const newData = {
      key: count,
      name: `New`,
      type: 'string',
      desc: 'desc',
      def: '0',
    };
    this.setState({
      dataSource: [...dataSource, newData],
      count: count + 1,
    });
    this.props.onDataChange(this.state.dataSource);
  };

  handleSave = (row: any) => {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
    this.props.onDataChange(this.state.dataSource);
  };

  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };
    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: any) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });
    return (
      <div>
        {this.props.addable !== false && (
          <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
            <PlusOutlined />
          </Button>
        )}
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          pagination={false}
          columns={columns}
        />
      </div>
    );
  }
}

export default EditableTable;

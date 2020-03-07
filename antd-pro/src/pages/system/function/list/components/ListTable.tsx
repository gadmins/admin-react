/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useContext, useEffect, MutableRefObject } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import '../index.less';

import { Table, Select, Checkbox, Form, Input } from 'antd';

const { Option } = Select;

const EditableContext = React.createContext<any>({});
const type = 'DragbleBodyRow';

const DragableBodyRow = ({
  index = 0,
  moveRow = (_i: number, _idx: number) => {},
  className = '',
  style = {},
  ...restProps
}) => {
  const [form] = Form.useForm();
  const ref = React.useRef();
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item: any) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    item: { type, index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr
          ref={ref}
          className={`${className}${isOver ? dropClassName : ''}`}
          style={{ cursor: 'move', ...style }}
          {...restProps}
        />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  handleSave: (record: any) => void;
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
  const inputRef: MutableRefObject<any> = useRef();
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
            message: `${title} is required.`,
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

const TableCheckBox = (props: any) => {
  const { record, fieldName, checked, onChange } = props;
  const onCheckChange = (e: any) => {
    onChange(record, fieldName, e.target.checked);
  };
  return <Checkbox onChange={onCheckChange} checked={checked} />;
};

const TableSelect = (props: any) => {
  const { record, fieldName, onChange } = props;
  const handleChange = (value: string) => {
    onChange(record, fieldName, value);
  };
  return (
    <Select defaultValue={props.type} style={{ width: 120 }} onChange={handleChange}>
      <Option value="text">文字</Option>
      <Option value="date">日期</Option>
      <Option value="dateTime">日期和时间</Option>
      <Option value="money">金额</Option>
    </Select>
  );
};

export default (props: any) => {
  const { dataSrouce, onDataChange } = props;
  const handleSave = (row: any) => {
    const newData = [...dataSrouce];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    onDataChange(newData);
  };

  const onCheckChange = (record: { [x: string]: any }, fieldName: React.Key, value: any) => {
    // eslint-disable-next-line no-param-reassign
    record[fieldName] = value;
    handleSave(record);
  };

  const columns = [
    {
      title: '序号',
      width: 70,
      render: (_text: any, _record: any, index: number) => `${index + 1}`,
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 150,
      editable: true,
    },
    {
      title: '字段',
      dataIndex: 'dataIndex',
      width: 150,
      editable: true,
    },
    {
      title: '类型',
      width: 200,
      dataIndex: 'valueType',
      render: (text: string, record: any) => (
        <TableSelect record={record} fieldName="valueType" type={text} onChange={onCheckChange} />
      ),
    },
    {
      title: '列表展示',
      dataIndex: 'hideInTable',
      render: (val: any, record: any) => (
        <TableCheckBox
          fieldName="hideInTable"
          record={record}
          onChange={onCheckChange}
          checked={val}
        />
      ),
    },
    {
      title: '搜索栏展示',
      dataIndex: 'hideInSearch',
      render: (val: any, record: any) => (
        <TableCheckBox
          fieldName="hideInSearch"
          record={record}
          onChange={onCheckChange}
          checked={val}
        />
      ),
    },
  ].map(col => {
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
        handleSave,
      }),
    };
  });
  const moveRow = (dragIndex: number, hoverIndex: number) => {
    const dragRow = dataSrouce[dragIndex];
    const updatedData = update(dataSrouce, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, dragRow],
      ],
    });
    onDataChange(updatedData);
  };
  return (
    <DndProvider backend={HTML5Backend}>
      <Table
        pagination={false}
        columns={columns}
        rowClassName={() => 'editable-row'}
        dataSource={dataSrouce}
        components={{
          body: {
            row: DragableBodyRow,
            cell: EditableCell,
          },
        }}
        onRow={(_, index) => ({
          index,
          moveRow,
        })}
      />
    </DndProvider>
  );
};

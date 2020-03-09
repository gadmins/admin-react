import { PageHeaderWrapper } from '@ant-design/pro-layout';
import React, { useState } from 'react';
import { Layout, Row, Col, Menu, Card } from 'antd';
import styles from './index.less';

const { Content } = Layout;

export default () => {
  // const [loading, setLoading] = useState<boolean>(true);
  // useEffect(() => {
  //   setTimeout(() => {
  //     setLoading(false);
  //   }, 1000);
  // }, []);
  const [key, setKey] = useState<string>('b');
  const click = (e: any) => {
    setKey(e.key);
  };
  return (
    <PageHeaderWrapper>
      <Card className={styles.main}>
        <Row>
          <Col span={3}>
            <Menu defaultSelectedKeys={[key]} theme="light" mode="inline" onClick={click}>
              <Menu.Item key="b">基本设置</Menu.Item>
              <Menu.Item key="c">安全设置</Menu.Item>
            </Menu>
          </Col>
          <Col>
            <Content style={{ padding: '0 24px', minHeight: 280 }}>
              {key === 'b' && <div>基本设置</div>}
              {key === 'c' && <div>安全设置</div>}
            </Content>
          </Col>
        </Row>
      </Card>
    </PageHeaderWrapper>
  );
};

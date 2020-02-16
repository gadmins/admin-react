import { Button, Result } from 'antd';
import React from 'react';
import { router } from 'umi';

// 这里应该使用 antd 的 404 result 组件，
// 但是还没发布，先来个简单的。

const NoFoundPage: React.FC<{}> = () => (
  <Result
    status="404"
    title="404"
    subTitle="对不起，页面未找到"
    extra={
      <Button type="primary" onClick={() => router.push('/')}>
        返回主页
      </Button>
    }
  />
);

export default NoFoundPage;

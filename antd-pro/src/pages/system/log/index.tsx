/* eslint-disable react/no-danger */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import useWebSocket from 'react-use-websocket';
import anime from 'animejs';
import { Button } from 'antd';
import styles from './style.less';

export default () => {
  const [socketUrl] = useState(
    `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}/ws/logging`,
  );
  const messageHistory = useRef<MessageEvent[]>([]);
  const [isClear, setIsClear] = useState<boolean>(false);

  const { lastMessage } = useWebSocket(socketUrl);

  messageHistory.current = useMemo(() => {
    if (isClear) {
      return [lastMessage];
    }
    return messageHistory.current.concat(lastMessage);
  }, [lastMessage]);

  const [messagesEnd, setMessagesEnd] = useState<HTMLDivElement | undefined>(undefined);

  const scrollToBottom = () => {
    if (messagesEnd) {
      anime({
        targets: messagesEnd,
        scrollTop: [messagesEnd.scrollTop, `+=${messagesEnd.scrollHeight - messagesEnd.scrollTop}`],
        duration: 800,
      });
    }
  };

  useEffect(() => {
    setIsClear(false);
    scrollToBottom();
    return () => {};
  }, [messageHistory.current]);

  return (
    <PageHeaderWrapper>
      <div>实时日志</div>
      <Button
        onClick={() => {
          setIsClear(true);
        }}
      >
        清空
      </Button>
      {messageHistory.current && messageHistory.current.length > 0 && (
        <div
          className={styles.log_content}
          dangerouslySetInnerHTML={{
            __html: isClear ? '' : messageHistory.current.map((it: any) => it && it.data).join(''),
          }}
          ref={(el: HTMLDivElement) => {
            setMessagesEnd(el);
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};

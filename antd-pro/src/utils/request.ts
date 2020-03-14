/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification, message } from 'antd';
import { stringify } from 'qs';
import { history } from 'umi';

const codeMessage = {
  400: '参数错误。',
  401: '未登录。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '未发现',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    response
      .clone()
      .json()
      .then(data => {
        if (data && data.msg) {
          if (data.code === 501) {
            if (window.location.pathname !== '/account/login') {
              message.error(data.msg);
              const queryString = stringify({
                redirect: window.location.href,
              });
              history.replace(`/account/login?${queryString}`);
            }
          } else {
            message.error(data.msg);
          }
        } else {
          notification.error({
            message: `请求错误 ${status}: ${url}`,
            description: errorText,
          });
        }
      })
      .catch(() => {
        notification.error({
          message: `请求错误 ${status}: ${url}`,
          description: errorText,
        });
      });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }

  return response;
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

export default request;

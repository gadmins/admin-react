// export const qiankun = Promise.resolve({
//     // 注册子应用信息
//     apps: [
//         {
//             name: 'app1', // 唯一 id
//             entry: '//localhost:7104', // html entry
//         }
//     ],
//     // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
//     lifeCycles: {
//         afterMount: (props: any) => {
//             console.log(props);
//         },
//     },
//     // 支持更多的其他配置，详细看这里 https://qiankun.umijs.org/zh/api/#start-opts
// })

// async function getConfig() {
//     return {
//         apps: [
//             {
//                 name: 'app1', // 唯一 id
//                 entry: '//localhost:7104', // html entry
//             }
//         ]
//     }
// }

// export const qiankun = getConfig().then(({ apps }) => ({
//     // 注册子应用信息
//     apps,
//     // 完整生命周期钩子请看 https://qiankun.umijs.org/zh/api/#registermicroapps-apps-lifecycles
//     lifeCycles: {
//         afterMount: (props: any) => {
//             console.log(props);
//             console.log(apps);
//         },
//     },
//     // 支持更多的其他配置，详细看这里 https://qiankun.umijs.org/zh/api/#start-opts
// }));

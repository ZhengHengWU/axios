import axios from 'axios'; // 引入axios
import showToast from '../plugins/ToastMessage';
import store from '../store/index.js'
import ElementUI from 'element-ui'
/** 
 * 提示函数 
 * 禁止点击蒙层、显示一秒后关闭
 */
const tip = msg => {
    //showToast(msg);
    ElementUI.Message.error(msg);
}

/** 
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
const toLogin = () => {
    setTimeout(function () {
        location.href = "/";
    }, 1000);
}

/** 
 * 请求失败后的错误统一处理 
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, other) => {
    // 状态码判断
    switch (status) {
        // 401: 未登录状态，跳转登录页
        case 401:
			tip('Token过期，请重新登录');
            store.commit("setToken", '');
            toLogin();
            break;
        // 403 token过期
        // 清除token并跳转登录页
        case 403:
            tip('登录过期，请重新登录');
            store.commit("setToken", '');
            setTimeout(() => {
                toLogin();
            }, 1000);
            break;
        // 404请求不存在
        case 404:
            tip('请求的资源不存在');
            break;
        default:
            console.log(other);
    }
}

axios.defaults.baseURL = 'https://localhost:5001/api/';

axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/json';


//先导入vuex,因为我们要使用到里面的状态对象 
//vuex的路径根据自己的路径去写
axios.interceptors.request.use(
    config => {
        config.url = config.baseURL + config.url;
        const token = store.state.token;
        token && (config.headers.Authorization = "Bearer " + token);
        return config;
    },
    error => {
        return Promise.error(error);
    })

// // 响应拦截器
axios.interceptors.response.use(

    // 请求成功
    res => res.status === 200 ? Promise.resolve(res) : Promise.reject(res),
    // 请求失败
    error => {
        const { response } = error;
        if (response) {
            // 请求已发出，但是不在2xx的范围 
            errorHandle(response.status, response.data);
            return Promise.reject(response);
        }
        return Promise.reject(error);
    });

/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
    return new Promise((resolve, reject) => {
        axios.get(url, {
            params: params
        }).then(res => {
            resolve(res.data);
        }).catch(err => {
            reject(err.data);
        })
    });
}
/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数
 */
export function post(url, params = {}) {
    return new Promise((resolve, reject) => {
        axios.post(url, JSON.stringify(params))
            .then(res => {
                resolve(res.data);
            })
            .catch(err => {
                reject(err.data);
            })
    });
}
import Vue from 'vue';
import App from './app.vue';
import VueRouter from 'vue-router';
import Routers from './router.js';
import Vuex from 'vuex';
import './style.css';

//导入本地数据
import product_data from './product.js';

Vue.use(VueRouter);
Vue.use(Vuex);

//

//配置路由
const RouterConfig = {
    //使用HTML5的History路由模式
    mode: 'history',
    routes: Routers
};

const router = new VueRouter(RouterConfig);

router.beforeEach((to, from, next) => {
    window.document.title = to.meta.title;
    next()
});

router.afterEach((to, from, next) => {
    window.scrollTo(0, 0);
});

//数组除重
function getFilterArray(array) {
    const res = [];
    const json = {};
    for (let i = 0; i < array.length; i++) {
        const _self = array[i];
        if (!json[_self]) {
            res.push(_self);
            json[_self] = 1
        }
    }
    return res;
}


//vuex
const store = new Vuex.Store({
    state: {
        //商品列表数据
        productList: [],
        //购物车数据
        cartList: []
    },
    getters: {
        brands: state => {
            const brands = state.productList.map(item => item.brand);
            return getFilterArray(brands)
        },
        colors: state => {
            const colors = state.productList.map(item => item.color);
            return getFilterArray(colors)
        }
    },
    mutations: {
        //清空购物车
        emptyCart(state){
            state.cartList = [];
        },
        //修改商品数量
        editCartCount(state, payload) {
            const product = state.cartList.find(item => item.id === payload.id);
            product.count += payload.count;
        },
        //删除商品
        deleteCart(state, id) {
            const index = state.cartList.find(item => item.id === id);
            state.cartList.splice(index, 1);
        },
        //添加到购物车
        addCart(state, id) {
            //先判断购物车是否已有,如有,数量+1
            const isAdded = state.cartList.find(item => item.id === id);
            if (isAdded) {
                isAdded.count++;
            } else {
                state.cartList.push({
                    id: id,
                    count: 1
                })
            }
        },
        //添加商品列表
        setProductList(state, data) {
            state.productList = data
        }
    },
    actions: {
        //购买
        buy(context){
          //真实环境通过Ajax提交购买请求后再清空购物列表
          return new Promise(resolve => {
              setTimeout(()=>{
                  context.commit('emptyCart');
                  resolve();
              },500)
          })
        },
        //请求商品列表
        getProductList(context) {
            //真实环境通过Ajax获取,这里用异步模拟
            setTimeout(() => {
                context.commit('setProductList', product_data);
            }, 500);
        }
    }
});

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => {
        return h(App)
    }
});
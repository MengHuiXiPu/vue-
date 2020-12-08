import Vue from 'vue'
// 导入vue路由的基础包
import VueRouter from 'vue-router'
Vue.use(VueRouter)

// 引入饿了么UI的相关插件已经css文件
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)

// 导入我们现在的axios包
import axios from 'axios'
// 设置基地址
axios.defaults.baseURL = 'https://autumnfish.cn'
// 把axios设置给Vue的原型
Vue.prototype.$axios = axios 

// 导入我们定义的App自定义的组件
import App from './App.vue'


// 全局引入的css写在main.js文件里面
import "./assets/css/iconfont.css"

// 路由规则 第一步 导入路由切换需要的组件
import Swipper from "./components/swipper.vue"
import Results from "./components/results.vue"
import  MV from "./components/mv.vue"
import Player from "./components/player.vue"
import Comment from "./components/comment.vue"

// 路由规则 第二步  声明路由规则的变量
const routes = [{
  path:"/",
  // 路由重定向，这个地址如果不存在，不会报错，但是我们不能犯这个错误
  redirect:"/swipper"
},{
  path:"/swipper",
  component:Swipper
},{
  // 动态路由匹配，首先要改变路由定义的规则
  path:"/results/:keyword",
  component:Results
},{
  path:"/mv",
  component:MV
},{
  path:"/player",
  component:Player
},{
  path:"/comment",
  component:Comment
}]

// 路由规则 第三步 实例化路由对象
const router = new VueRouter({
  routes
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

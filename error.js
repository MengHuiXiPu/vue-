import { createApp } form 'vue'
import App from './App.vue'

let app = createApp(app)

//全局监听异常
window.addEventListener('error', e => {
    //上报逻辑
    console.log(e)
    return true
}, true)

//捕获Promise内部错误
window.addEventListener('unhanklerejection', e => {
    throw e.reason
})
//监听VUE工程内部异常
app.config.errorHandler = function (err, vm, info) {

    //上报逻辑
    console.log(err, vm, info)
}
app.mount('#app')

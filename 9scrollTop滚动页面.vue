页面的滚动 原生 scrollTop  vueRouter提供的 scrollBehavior钩子

const router=new Router({
    routes:[...],
    scrollBehavior(to,from,position){
        return {
            x:100,
            y:100,
            selector:#app,
            offset：200
            ....
        }
    }
})
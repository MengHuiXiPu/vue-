异步组件可以然给我们在需要一些组件的时候才将它加载进来，而不是初始化就加载进来，这个和路由懒加载时一个概念。
export default{
    components:{
        AsyncComponents:()=>import('./Async')
    }
}
第二种更为完善的写法

export default{
    components:{
        AsyncComponent:()=>({
            component:import('/Async'),
            delay:200,//延迟几毫秒
            timeout:3000,//加载几毫秒之后就超时，触发error组件
            loading:LoadingComponent,//组件未加载回来前展示
            error:ErrorComponent//组件超时展示

        })
    }

}
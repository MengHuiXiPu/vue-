
Vue初始化的时候会将data里面的数据变成响应式数据 ，但是我们的一些静态数据，比如kv，永不会变
所以可以使用Object.freeze方法进行冻结。避免vue初始化的时候，做一些无用功


export default{
    const namelist=[
        {name:'zs',age:1},
        {name:'zs1',age:11},
        {name:'zs2',age:12},
    ]
    data(){
        list：Object.freeze(namelist)
    }
}
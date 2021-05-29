常规写法 component属性中通过this.xxx 去获取data里面的数据，或者methods中的方法。
this.route去获取路由里面的参数
现在要说的是它可能会带来看不见的性能问题，实际上，通过this能够访问的数据，在componetd的第一个参数上就能解构出来
例如
export default{

    haha({$attrs,$route,$srote,$listeners,$ref}){
        //还可以解构出很多属性
        return
    }
}
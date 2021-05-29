如果想要在父组件控制一个子组件的显示和隐藏，通常是传递一个prop和一个自定义方法，
现在可以使用sync修饰符了

//父组件
<template>
<div>

<Togge :show.sync='show'/>

</div>


</template>

//togge组件
<template>
<div>
    <div v-if='show>
        显示和隐藏组件
    </div>
    <button @click='test'>隐藏组件</button>

</div>
</template>


export default{
    props:['show'],
    methods:{
        tese(){
            this.$emit('update:show',false)
        }
    }

}
<template>
  <div>
    <h2>深度侦听原理展示</h2>
    <p v-for="(num,index) in arr" :key="index">{{num}}</p>
    <button @click="changeArr5">点击我改变数组中的第5个元素</button>
  </div>
</template>

<script>
export default {
  data(){
    return {
      arr :[1,2,3,4,5,6,7,8]
    }
  },
  watch:{
    'arr': {
        handler(newVal, oldVal) {
          console.log(newVal)
          console.log(oldVal)
        },
        // 开启深度侦听
        deep: true
      }
  },
  methods:{
    changeArr5(){
      this.arr[4] += 1000
      this.arr = [...this.arr]
    }
  }
}
</script>

<style>

</style>
function defineReactive(obj, key, val, shallow) {
    // 实例化一个 dep， 一个 key 对应一个 dep
    const dep = new Dep()
   
    // 获取属性描述符
    const getter = property && property.get
    const setter = property && property.set
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key]
    }
  
    // 通过递归的方式处理 val 为对象的情况，即处理嵌套对象
    let childOb = !shallow && observe(val)
    
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      // 拦截obj.key，进行依赖收集
      get: function reactiveGetter () {
        const value = getter ? getter.call(obj) : val
        // Dep.target 是当前组件渲染的 watcher
        if (Dep.target) {
          // 将 dep 添加到 watcher 中
          dep.depend()
          if (childOb) {
            // 嵌套对象依赖收集
            childOb.dep.depend()
            // 响应式处理 value 值为数组的情况
            if (Array.isArray(value)) {
              dependArray(value)
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        // 获取旧值
        const value = getter ? getter.call(obj) : val
        // 判断新旧值是否一致
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        if (process.env.NODE_ENV !== 'production' && customSetter) {
          customSetter()
        }
  
        if (getter && !setter) return
        // 如果是新值，用新值替换旧值
        if (setter) {
          setter.call(obj, newVal)
        } else {
          val = newVal
        }
        // 新值做响应式处理
        childOb = !shallow && observe(newVal)
        // 当响应式数据更新，依赖通知更新
        dep.notify()
      }
    })
  }
  复制代码
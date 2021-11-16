let uid = 0
class Dep {
  constructor() {
    this.id = uid++
    // 存储所有的 watcher
    this.subs = []
  }
  addSub(sub) {
    this.subs.push(sub)
  }
  removeSub(sub) {
    if(this.subs.length) {
      const index = this.subs.indexOf(sub)
      if(index > -1) return this.subs.splice(index, 1)
    }
  }
  notify() {
    this.subs.forEach(sub => {
      sub.update()
    })
  }
}

class Watcher {
  constructor(name) {
    this.name = name
  }
  update() {
    console.log('更新')
  }
}
# 通过发布订阅，实现多功能，多方向的 Message

## 文章目录

- 交互展示
- 使用方法
- 实现需求
- 发布订阅实现思路
- 关闭，更新弹框实现思路
- 动画实现思路

组件库地址：**github.com/Ryan-eng-de…**[1]

## - 交互展示



## 使用方法

`Ocean UI` export 出 useMessage Hook, 用来对弹窗进行管理

```
const { message, close, update } = useMessage();
```

- **message**：创建弹窗。
- **close**: 关闭弹窗，传入弹窗 Id，进行关闭。
- **update**: 更新弹窗，传入弹窗 Id，进行更新。

## 实现需求

# Message

全局展示操作反馈信息。

## 何时使用

- 可提供成功、警告和错误等反馈信息。
- 顶部居中显示并自动消失，是一种不打断用户操作的轻量级提示方式。

## 基本使用 - Usage

`Ocean UI` export 出 useMessage Hook, 用来对弹窗进行管理。

```
const { message, close, update } = useMessage();
```

- **message**：创建弹窗。
- **close**: 关闭弹窗，传入弹窗 Id，进行关闭。
- **update**: 更新弹窗，传入弹窗 Id，进行更新。

``

## 实现需求

##### 不同方向 - Direction

`Ocean UI` 支持六种方向的弹窗，分别是 top,bottom,top-left,top-right,bottom-left,bottom-right。

##### 可关闭弹窗

**message**：创建弹窗方法，会返回窗口的 id，然后通过 close 方法进行关闭。

##### 更新弹窗

**update**: 更新弹窗，传入弹窗 Id，进行更新。

##### 弹窗标题

通过 title 属性，设置弹窗标题。

##### 不同状态

`Alert` 有四种 `Status` 可以使用，分别是 `info` `success` `warning` `error`。你可以将 `variant` 和 `status` 进行组合，也可以就其中一个，进行单独使用。

##### 不同类别

`Message` 有四种 `variant` 可以使用，你可以将 `variant` 和 `status` 进行组合，也可以就其中一个，进行单独使用。

四种风格，分别是 `solid`、`left-line`、 `top-line` or `bottom-line`。

## 发布订阅实现思路

第一：定义六个方向的 `message` 数组。

```
const initialState: State = {
  top: [],
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  bottom: [],
  'bottom-right': [],
};
复制代码
```

第二：通过 createStore 创建 store，并且通过 useSyncExternal 来订阅 store

```
 const MessageStore = createStore()
 
  const store = useSyncExternalStore(
    MessageStore.subscribe,
    MessageStore.getState,
    MessageStore.getState,
  );
复制代码
```

第三：定义 store 当中的方法

- **getState**: 第一个作用是用来获取 state, 第二个作用是传递 useSyncExternalStore 第二个 `getSnapshot` 参数，刷新后，可以拿到最新的 state。
- **subscribe** :订阅 store 更新。
- **notify**: 发布方法，创建弹框。
- **close**: 根据 id 关闭弹窗方法。
- **closeId**: 根据 id 和 position 关闭弹窗。
- **update**：根据 id 更新弹框。

```
export interface MessageStore {
  getState: () => State;
  subscribe: (listener: () => void) => () => void;
  notify: (message: (props: Message) => JSX.Element, opt: Message) => React.Key;
  close: (id: React.Key) => void;
  update: (
    message: (props: Message) => JSX.Element,
    opt: Message,
    id: React.Key,
  ) => void;
  closeId: (position: MessagePosition, id: React.Key) => void;
}
复制代码
```

第四：定义 useMessage Hook，导出三个函数供用户消费。message, close, update

- message 创建
- close 关闭
- update 更新

```
export function useMessage() {
  return { message, update, close };
}
复制代码
```

第五: 实现 message 方法，也就是弹出弹框的方法

- message 方法做了两件事情。
- 第一件事情，创建 message 组件。
- 第二件事情，发布组件到 store，store 更新，UI 更新。

```
export function message(opt: Message) {
  const message = createRenderMessage(opt);
  return MessageStore.notify(message, opt);
}
复制代码
```

第六: 实现 createRenderMessage 方法。

- createRenderMessage 方法一共做了两件事情。
- 第一件事情，为每一个弹框增加一个id。
- 第二件事情，返回 message 函数组件 -> `<MessageComponent {...opt} {...props} id={id} />` 就是组件本身。

```
function createRenderMessage(opt: Message) {
  counter += 1;
  const id = opt.id ?? counter;
  return function messageRender(props: any) {
    return <MessageComponent {...opt} {...props} id={id} />;
  };
}
复制代码
```

第七：实现发布方法 notify

- notify 方法一共做了两件事情。
- 第一件事情：通过 setStore 方法，传递更新函数来更新 store。
- 第二件事情，整理 message 的props ，返回弹框id，以便于后序的关闭和更新操作。

```
    notify(message: (props: Message) => JSX.Element, opt: Message) {
      const {
        message: messageCpn,
        id,
        position = 'top',
      } = createMessage(message, opt);

      setStore((preStore) => {
        const msg = { messageCpn, id };
        const msgs = position.includes('top')
          ? [msg, ...(preStore[position] ?? [])]
          : [...(preStore[position] ?? []), msg];

        return {
          ...preStore,
          [position]: msgs,
        };
      });
      return id;
    },
复制代码
```

第八：notify 之后，通过 setStore 方法执行 listener 更新 store，

```
  const setStore = (updateStore: (oldStore: State) => State) => {
    state = updateStore(state);
    listeners.forEach((listener) => {
      listener();
    });
  };
复制代码
```

第九：遍历整个 store 产生弹框

```
  const PortalChild = positionKeys.map((k) => {
    return (
      <ocean.div
        __css={baseStyle(k as MessagePosition)}
        key={k}
        className={`ocean-${k}-message`}
      >
        <AnimatePresence initial={false}>
          {store[k as keyof typeof store].map((Msg) => {
            return (
              <Fragment key={Msg.id}>
                <Msg.messageCpn />
              </Fragment>
            );
          })}
        </AnimatePresence>
      </ocean.div>
    );
  });

  return createPortal(PortalChild, document.body);

复制代码
```

### 关闭，更新弹窗实现思路

关闭实现：用户可以通过 close 方法，传入 message 方法返回的弹窗id，对弹窗进行关闭

通过 setStore 方法，通过 getMsgPosition 找到 store 中要关闭的弹窗，通过 filter 方法进行删除。

```
    close(id: React.Key) {
      setStore((prevState) => {
        const position = getMsgPosition(prevState, id);
        if (!position) return prevState;
        return {
          ...prevState,
          [position]: prevState[position].filter((toast) => {
            return id !== toast.id;
          }),
        };
      });
    },
复制代码
```

更新实现：用户可以通过 update 方法，传入 message 方法返回的弹窗id，对弹窗进行更新。

通过 setStore 方法，通过 createMessage 重新根据配置项生成弹窗，找到需要更新的弹窗。将新弹窗替换旧弹窗。

```
    update(
      message: (props: Message) => JSX.Element,
      opt: Message,
      id: React.Key,
    ) {
      const { message: messageCpn, id: newId } = createMessage(message, opt);

      setStore((prevState) => {
        const newState = { ...prevState };
        const position = getToastPosition(prevState, id);
        if (!position) return prevState;

        const oldIndex = prevState[position].findIndex((p) => {
          return p.id === id;
        });

        newState[position][oldIndex] = { messageCpn, id: newId };
        return newState;
      });
    },


复制代码
```

### 动画实现思路

动画使用了 Motion 库。

第一步：创建动画组件 motion.li。

- 传入 layout props，产生布局平滑过渡动画。

![图片](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKkMRhFsorTK3hIgOHtyWVv6NwuCR7ep7YjAAPgGgBsAWYE1Mzl9OxoNhiaFlwR0YgFDOZDDfjlhiaPw/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image.png

- 传入 variants 告诉 motion，该组件 initial, animate, exit 的阶段应该做什么。

```
    <motion.li
      layout
      className="ocean-msg"
      variants={motionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={{ position }}
      style={{ display: 'flex', padding: '6px' }}
    >
    
    弹框内容
    </motion.li>
复制代码
```

- 引入 AnimatePresence 组件，来阻止非第一个 message 组件的 intial 动画。也就是使非第一个 message 组件 直接进入 animate 动画。这样就可以实现效果。

![图片](https://mmbiz.qpic.cn/mmbiz/bwG40XYiaOKkMRhFsorTK3hIgOHtyWVv6skicZ91PYFhYGpHQ5ibaNftvA2L0eb6EYkkcolycib5nIlfFQJPb5Q4PQ/640?wx_fmt=other&wxfrom=5&wx_lazy=1&wx_co=1)image.png

```
        <AnimatePresence  initial={false}>
          {store[k as keyof typeof store].map((Msg) => {
            return (
              <Fragment key={Msg.id}>
                <Msg.messageCpn />
              </Fragment>
            );
          })}
        </AnimatePresence>
复制代码
```

## 核心代码

### provider

```
export const MessageProvider = () => {
  const store = useSyncExternalStore(
    MessageStore.subscribe,
    MessageStore.getState,
    MessageStore.getState,
  );

  const baseStyle = (ps: MessagePosition): StyleProps => ({
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: 30,
    alignItems: 'center',
    ...positionStyle[ps],
  });

  const positionKeys = Object.keys(store);

  const PortalChild = positionKeys.map((k) => {
    return (
      <ocean.div
        __css={baseStyle(k as MessagePosition)}
        key={k}
        className={`ocean-${k}-message`}
      >
        <AnimatePresence initial={false}>
          {store[k as keyof typeof store].map((Msg) => {
            return (
              <Fragment key={Msg.id}>
                <Msg.messageCpn />
              </Fragment>
            );
          })}
        </AnimatePresence>
      </ocean.div>
    );
  });

  return createPortal(PortalChild, document.body);
};
复制代码
```

### store

```
import { Message, MessagePosition } from './message';
const initialState: State = {
  top: [],
  'top-left': [],
  'top-right': [],
  'bottom-left': [],
  bottom: [],
  'bottom-right': [],
};

let counter = 0;

function createMessage(message: (props: Message) => JSX.Element, opt: Message) {
  counter += 1;
  const id = opt.id ?? counter;
  return { message, id, ...opt };
}

export interface MessageStore {
  getState: () => State;
  subscribe: (listener: () => void) => () => void;
  notify: (message: (props: Message) => JSX.Element, opt: Message) => React.Key;
  close: (id: React.Key) => void;
  update: (
    message: (props: Message) => JSX.Element,
    opt: Message,
    id: React.Key,
  ) => void;
  closeId: (position: MessagePosition, id: React.Key) => void;
}

export const findById = (arr: any[], id: React.Key) =>
  arr.find((toast) => toast.id === id);

export function getToastPosition(toasts: State, id: React.Key) {
  for (const [position, values] of Object.entries(toasts)) {
    if (findById(values, id)) {
      return position as MessagePosition;
    }
  }
}

function createStore(): MessageStore {
  let state = initialState;
  const listeners = new Set<any>();

  const setStore = (updateStore: (oldStore: State) => State) => {
    state = updateStore(state);
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    closeId: (position, id) => {
      setStore((prevState) => ({
        ...prevState,
        [position]: prevState[position as keyof State].filter(
          (toast) => toast.id !== id,
        ),
      }));
    },

    getState: () => state,

    subscribe(listener: any) {
      listeners.add(listener);
      return () => {
        setStore(() => {
          return initialState;
        });
        listeners.delete(listener);
      };
    },

    update(
      message: (props: Message) => JSX.Element,
      opt: Message,
      id: React.Key,
    ) {
      const { message: messageCpn, id: newId } = createMessage(message, opt);

      setStore((prevState) => {
        const newState = { ...prevState };
        const position = getToastPosition(prevState, id);
        if (!position) return prevState;

        const oldIndex = prevState[position].findIndex((p) => {
          return p.id === id;
        });

        newState[position][oldIndex] = { messageCpn, id: newId };
        return newState;
      });
    },

    notify(message: (props: Message) => JSX.Element, opt: Message) {
      const {
        message: messageCpn,
        id,
        position = 'top',
      } = createMessage(message, opt);

      setStore((preStore) => {
        const msg = { messageCpn, id };
        const msgs = position.includes('top')
          ? [msg, ...(preStore[position] ?? [])]
          : [...(preStore[position] ?? []), msg];

        return {
          ...preStore,
          [position]: msgs,
        };
      });
      return id;
    },

    close(id: React.Key) {
      setStore((prevState) => {
        const position = getToastPosition(prevState, id);
        if (!position) return prevState;
        return {
          ...prevState,
          [position]: prevState[position].filter((toast) => {
            return id !== toast.id;
          }),
        };
      });
    },
  };
}

export default createStore();

复制代码
```
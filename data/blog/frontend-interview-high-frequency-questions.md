---
title: 最近准备前端面试时，我整理的一些高频问题
date: 2026-06-27
excerpt: 一份偏面试回答视角的前端高频问题整理，覆盖网络通信、TCP、AI 辅助编码、项目选型、CSS、JS 和 React 异步请求。
---

# 最近准备前端面试时，我整理的一些高频问题

最近在准备前端相关的面试，发现很多问题看起来很基础，但真正要在面试里说清楚，其实并不容易。比如 WebSocket、TCP 三次握手、JS 异步、CSS 布局、Next.js 选型、Prisma 这些内容，平时写项目的时候可能都用过，但是一到面试就容易说得很散。

所以我把这次复习过程中遇到的一些问题整理成一篇文章。整体会尽量用我自己的理解来写，不是那种特别官方的八股文，而是偏“如果面试官问到，我会怎么回答”的风格。

这篇主要分成几个部分：

- 网络 / 通信相关
- TCP 高频面试题
- AI 辅助编码怎么回答
- 个人项目技术选型
- Next.js 和 Prisma 的选择理由
- CSS 高频基础
- JS / 浏览器相关
- 一个 React 异步请求代码题

---

## 一、网络 / 通信相关

### 1. WebSocket 是什么？底层原理是什么？

WebSocket 我理解它最核心的特点就是：**长连接、双向通信、低延迟**。

平时我们用 HTTP 的时候，一般是客户端发起请求，服务端返回响应。也就是说，大多数情况下是客户端主动问，服务端被动答。比如浏览器请求一个接口：

```txt
浏览器：我要用户信息
服务端：这是用户信息
```

但是如果是聊天、通知、实时数据推送这种场景，就不能一直靠客户端轮询。比如每隔 1 秒请求一次接口，虽然也能实现“接近实时”，但这样会浪费很多请求，而且延迟也不稳定。

WebSocket 就是为了解决这类实时通信场景的。

它建立连接之后，客户端和服务端都可以主动发送消息。比如服务端有一条新通知，可以直接推给客户端，而不用等客户端下一次请求。

我在面试里会这样回答：

> WebSocket 是一种基于 TCP 的全双工通信协议。它一开始通过 HTTP 发起握手，请求头里带上 `Upgrade: websocket`，服务端同意后返回 `101 Switching Protocols`，之后连接就从 HTTP 升级成 WebSocket。升级完成后，客户端和服务端就可以在同一个 TCP 长连接上通过 WebSocket 的帧格式进行双向通信。

这里有几个关键词要说出来：

- 一开始是 HTTP 握手
- 通过 `Upgrade` 升级协议
- 底层还是 TCP
- 建立后是长连接
- 双方都可以主动发送消息
- 数据通过 frame 传输

大概流程是这样：

```txt
客户端发起 HTTP 请求
        ↓
请求头带 Upgrade: websocket
        ↓
服务端返回 101 Switching Protocols
        ↓
协议升级成功
        ↓
双方通过 TCP 长连接传输 WebSocket frame
```

实际项目里还不能只知道怎么连上，还要考虑一些工程问题。比如：

- 怎么做鉴权？
- 连接断了怎么重连？
- 怎么判断连接还活着？
- 服务端连接数太多怎么办？
- 消息丢了要不要补偿？
- 是否需要用 `wss://`？

如果只是面试简单回答，可以总结成一句话：

> WebSocket 是通过 HTTP Upgrade 完成握手，然后基于 TCP 长连接实现双向通信的一种协议，适合聊天、通知、实时数据推送这类低延迟场景。

---

### 2. MQTT 和 RabbitMQ 是怎么用的？

这个问题一开始我自己也容易混，因为它们都和“消息”有关，但其实它们不是同一类东西。

我现在会先这样区分：

> MQTT 是一种通信协议，RabbitMQ 是一个消息中间件。

也就是说，MQTT 更偏“规则 / 协议”，RabbitMQ 更偏“服务 / 系统”。

---

#### MQTT

MQTT 是一种轻量级的发布订阅协议，特别常见于 IoT，也就是物联网场景。

它的核心模型是：

```txt
发布者 Publisher
        ↓
      Broker
        ↓
订阅者 Subscriber
```

比如一个温度传感器每隔几秒上报一次温度，它可以往一个 topic 发布消息：

```txt
device/temperature
```

服务端订阅这个 topic，就可以收到设备上报的数据。

MQTT 的好处是比较轻量，适合网络不太稳定、设备性能有限的场景。

它还有 QoS 机制：

| QoS | 含义 |
|---|---|
| QoS 0 | 最多一次，可能丢消息 |
| QoS 1 | 至少一次，可能重复 |
| QoS 2 | 只有一次，最可靠但开销最大 |

如果面试官问 MQTT 的使用场景，我会说：

> MQTT 更适合设备端通信，比如智能家居、传感器上报、车联网、设备状态同步等场景。它通过 topic 做发布订阅，客户端不直接互相通信，而是都连接到 Broker。

---

#### RabbitMQ

RabbitMQ 是消息中间件，常见于后端系统解耦。

它的基本模型一般是：

```txt
Producer -> Exchange -> Queue -> Consumer
```

生产者不直接把消息给消费者，而是先把消息发给 Exchange，Exchange 再根据规则把消息路由到不同的 Queue，消费者再从 Queue 里取消息处理。

比如电商下单场景：

```txt
用户下单
  ↓
订单服务写入订单
  ↓
发送一条消息到 RabbitMQ
  ↓
库存服务扣库存
  ↓
短信服务发短信
  ↓
积分服务加积分
```

这样订单服务就不用同步等所有事情都做完，可以把一些非核心流程异步化。

RabbitMQ 常见能力有：

- ack 确认
- 消息持久化
- 死信队列
- 延迟重试
- 消费者限流
- 路由分发
- 削峰填谷

我自己的总结是：

> MQTT 适合设备通信和轻量发布订阅，RabbitMQ 适合后端服务之间的异步解耦、任务队列和可靠消费。

---

### 3. HTTP 请求是怎么变成一个 Web Server 请求的？

这个问题其实是在考你对完整网络链路的理解。

比如我们在浏览器输入一个地址：

```txt
https://example.com/user
```

大致过程是：

1. 浏览器解析 URL
2. DNS 把域名解析成 IP
3. 和服务器建立 TCP 连接
4. 如果是 HTTPS，还要进行 TLS 握手
5. 浏览器组装 HTTP 请求报文
6. 请求经过网络到达服务器
7. 可能先到负载均衡、Nginx 或网关
8. Web Server 接收 TCP 字节流
9. Web Server 解析成 HTTP 请求对象
10. 框架进行路由匹配和中间件处理
11. 执行业务逻辑
12. 返回 HTTP 响应
13. 浏览器解析响应并渲染页面

可以画成这样：

```txt
URL
 ↓
DNS 解析
 ↓
TCP 连接
 ↓
TLS 握手
 ↓
HTTP 请求报文
 ↓
Nginx / 网关 / 负载均衡
 ↓
Web Server
 ↓
路由 / 中间件
 ↓
业务代码
 ↓
数据库 / 缓存
 ↓
HTTP 响应
 ↓
浏览器渲染
```

面试里我会这样说：

> HTTP 请求本质上就是浏览器按照 HTTP 协议组织出来的一段文本或二进制数据，它通过 TCP 连接发送到服务器。服务器监听某个端口，收到 TCP 字节流后解析出 HTTP 请求，然后交给 Web 框架处理，比如匹配路由、执行中间件、调用业务函数，最后生成 HTTP 响应返回给浏览器。

我觉得这个问题最好不要只说“浏览器发请求，服务器接收请求”，而是要把 DNS、TCP、TLS、HTTP 解析、Web Server、应用框架这些层次讲出来。

---

## 二、TCP 面试需要知道什么

TCP 是网络面试里非常高频的一块。它本身比较偏基础，但是问题很多，而且经常会追问。

我觉得至少要掌握这些：

- TCP 是什么
- 三次握手
- 四次挥手
- TIME_WAIT
- CLOSE_WAIT
- 可靠传输
- 流量控制
- 拥塞控制
- 粘包 / 拆包
- TCP 和 UDP 区别
- 常见状态
- Nagle 算法

---

### 1. TCP 是什么？

TCP 是传输层协议，全称是 Transmission Control Protocol。

我一般记这几个特点：

```txt
面向连接
可靠传输
有序
字节流
全双工
```

解释一下：

- 面向连接：通信前需要三次握手
- 可靠传输：有 ACK、重传、序列号等机制
- 有序：接收方可以按正确顺序重组数据
- 字节流：TCP 不保留应用层消息边界
- 全双工：双方可以同时发送和接收数据

面试回答可以这样说：

> TCP 是一种面向连接的可靠传输协议，它在通信前需要通过三次握手建立连接，在传输过程中通过序列号、ACK、超时重传、滑动窗口、流量控制和拥塞控制等机制保证数据可靠、有序地到达。TCP 是基于字节流的，所以应用层需要自己处理消息边界问题。

---

### 2. TCP 三次握手

三次握手的过程是：

```txt
客户端                         服务端

SYN  ------------------------>
     <-------------------- SYN + ACK
ACK  ------------------------>
```

更具体一点：

第一次，客户端发送 SYN，表示想建立连接，同时带上自己的初始序列号 `seq = x`。

第二次，服务端收到 SYN 后，返回 SYN + ACK，表示同意建立连接，同时确认客户端的序列号，`ack = x + 1`，并带上服务端自己的初始序列号 `seq = y`。

第三次，客户端收到后，再发送 ACK，确认服务端的序列号，`ack = y + 1`。

这时连接建立成功。

```txt
客户端                           服务端
  | -------- SYN seq=x --------> |
  | <--- SYN+ACK seq=y ack=x+1 - |
  | -------- ACK ack=y+1 ------> |
```

---

### 3. 为什么不是两次握手？

这个问题特别常问。

我的理解是，三次握手主要是为了确认双方的发送和接收能力都正常。

两次握手的时候：

- 服务端可以确认客户端能发送，服务端能接收
- 客户端可以确认服务端能接收，也能发送

但是服务端还不能确认客户端能不能接收服务端发过去的数据。

第三次 ACK 就是在告诉服务端：

```txt
我收到了你的 SYN + ACK，说明我能接收，你也能发送。
```

还有一个原因是避免历史连接请求报文导致服务端误建立连接。

面试可以这样答：

> 三次握手不是为了多发一次包，而是为了让双方都确认对方的发送和接收能力正常。两次握手时，服务端还不能确认客户端是否具备接收能力，第三次 ACK 可以补上这个确认。同时三次握手也能避免过期的历史 SYN 报文导致服务端误建立连接。

---

### 4. TCP 四次挥手

四次挥手是关闭连接的过程：

```txt
主动关闭方                         被动关闭方

FIN  ---------------------------->
     <------------------------- ACK
     <------------------------- FIN
ACK  ---------------------------->
```

它的意思是：

第一次，主动关闭方发送 FIN，表示自己不再发送数据了。

第二次，被动关闭方收到 FIN 后返回 ACK，表示知道了。

第三次，被动关闭方如果数据也发完了，就发送 FIN，表示自己也要关闭。

第四次，主动关闭方收到 FIN 后返回 ACK，然后进入 TIME_WAIT。

---

### 5. 为什么挥手是四次？

因为 TCP 是全双工的。

客户端到服务端是一个方向，服务端到客户端是另一个方向。  
主动关闭方发送 FIN，只代表它自己没有数据要发了，但它还可以继续接收数据。

被动关闭方收到 FIN 后，可能还有数据没发完，所以先回一个 ACK。  
等它自己的数据也发完了，再单独发送 FIN。

所以通常是四次。

面试可以这样说：

> 三次握手是建立双向通信能力，而四次挥手是分别关闭两个方向的数据流。因为 TCP 是全双工的，一方发送 FIN 只表示自己不再发送数据，不代表对方也立即没有数据要发，所以 ACK 和 FIN 通常要分开发。

---

### 6. TIME_WAIT 是什么？

TIME_WAIT 是主动关闭连接的一方在最后发送 ACK 后进入的状态。

它会等待 2MSL 之后才真正关闭。

TIME_WAIT 的作用有两个：

第一，保证最后一个 ACK 能被对方收到。  
如果最后 ACK 丢了，对方会重发 FIN，这时主动关闭方还在 TIME_WAIT，就能再回 ACK。

第二，防止旧连接的延迟报文影响新连接。  
等待 2MSL 后，网络里属于这个连接的旧报文基本就消失了。

一句话：

> TIME_WAIT 是为了保证连接可靠关闭，并让旧报文在网络中自然消失。

---

### 7. CLOSE_WAIT 是什么？

CLOSE_WAIT 出现在被动关闭方。

如果一端收到对方的 FIN，并且已经回复 ACK，但是自己的应用程序还没有调用 close 关闭 socket，就会处于 CLOSE_WAIT。

如果线上看到大量 CLOSE_WAIT，通常说明：

- 程序没有正确关闭连接
- 异常分支没有释放资源
- 连接池管理有问题
- socket 生命周期处理不当

我会这么记：

```txt
TIME_WAIT 多：通常是主动关闭的一方太多
CLOSE_WAIT 多：通常是程序没 close
```

---

### 8. TCP 如何保证可靠传输？

TCP 的可靠性不是一句“它可靠”就结束了，背后有很多机制。

主要有：

1. 序列号  
   每个字节都有编号，用于排序和去重。

2. ACK 确认  
   接收方收到数据后返回确认。

3. 超时重传  
   发送方一段时间内没收到 ACK，就重新发送。

4. 滑动窗口  
   不用每发一个包都等 ACK，可以连续发多个，提高效率。

5. 流量控制  
   防止发送方太快，把接收方缓冲区打满。

6. 拥塞控制  
   防止网络中数据太多，导致链路拥塞。

7. 校验和  
   用于检测数据传输过程中是否出错。

面试一句话：

> TCP 通过序列号、ACK、重传、滑动窗口、流量控制、拥塞控制和校验和来保证数据可靠、有序、不丢失地到达。

---

### 9. 流量控制

流量控制解决的是：

```txt
发送方发太快，接收方处理不过来
```

TCP 通过接收窗口 `rwnd` 来做流量控制。

接收方会在 ACK 里告诉发送方：

```txt
我现在还能接收多少数据
```

发送方根据这个窗口大小控制发送速度。

如果接收窗口变成 0，发送方会暂停发送数据，但会定期发送窗口探测报文，看看窗口有没有恢复。

我会这样总结：

> 流量控制关注的是接收方能力，核心是接收窗口 rwnd，目的是不要把接收方打爆。

---

### 10. 拥塞控制

拥塞控制解决的是：

```txt
网络太堵，路由器或链路承载不过来
```

它关注的不是某一个接收方，而是整个网络环境。

常见的拥塞控制算法有：

- 慢启动
- 拥塞避免
- 快重传
- 快恢复

慢启动不是一直慢，而是刚开始窗口比较小，然后指数增长。  
达到阈值之后，进入拥塞避免，窗口线性增长。

如果发生超时丢包，说明网络可能已经拥塞，就会降低阈值，重新慢启动。

如果收到三个重复 ACK，说明可能只是某个包丢了，会触发快重传和快恢复。

我会这样总结：

> 拥塞控制关注的是网络承载能力，核心是拥塞窗口 cwnd，目的是不要把网络打爆。

---

### 11. 流量控制和拥塞控制区别

这个问题最好用表格说：

| 对比 | 流量控制 | 拥塞控制 |
|---|---|---|
| 解决问题 | 接收方处理不过来 | 网络链路拥堵 |
| 关注对象 | 接收方 | 整个网络 |
| 核心变量 | `rwnd` | `cwnd` |
| 目的 | 防止接收方被打爆 | 防止网络被打爆 |

一句话：

> 流量控制看接收方，拥塞控制看网络。

---

### 12. TCP 粘包 / 拆包

TCP 是字节流协议，它不关心应用层消息边界。

比如应用层连续发送两次：

```txt
hello
world
```

接收方可能一次读到：

```txt
helloworld
```

也可能分几次读到：

```txt
he
llo
world
```

这就是粘包和拆包。

这不是 TCP 的 bug，而是 TCP 的设计就是字节流。

解决方式一般有：

- 固定长度
- 特殊分隔符
- 消息头 + 消息体长度
- 使用已有协议，比如 HTTP、WebSocket、Protobuf、MQTT

项目里比较常见的是“消息头 + 消息体长度”。

比如先读 4 个字节作为长度，再根据长度读取后面的 body。

面试可以这样答：

> 粘包不是 TCP 出错，而是因为 TCP 是面向字节流的，不保留应用层消息边界。解决方式一般是在应用层定义协议，比如固定长度、分隔符，或者在消息头里写 body 长度。

---

### 13. TCP 和 UDP 区别

| 对比 | TCP | UDP |
|---|---|---|
| 是否连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠 | 不保证可靠 |
| 顺序 | 保证有序 | 不保证有序 |
| 开销 | 较大 | 较小 |
| 速度 | 相对慢 | 相对快 |
| 数据形式 | 字节流 | 数据报 |
| 场景 | HTTP、文件、支付 | 直播、语音、游戏、DNS |

我一般这样说：

> TCP 适合对可靠性要求高的场景，比如网页请求、文件传输、登录、支付。UDP 不保证可靠和有序，但是延迟低、开销小，适合直播、语音、游戏、DNS 这类实时性更重要的场景。

一句话就是：

```txt
TCP 要可靠，UDP 要速度。
```

---

### 14. Nagle 算法

Nagle 算法是为了减少小包数量。

它的大概思想是：

> 如果当前还有未确认的数据，小数据包先不要立刻发，等收到 ACK 或者积累到一定大小再发。

这样可以减少网络中很多很小的数据包，提高网络利用率。

但是它也可能增加延迟。

所以在一些低延迟场景，比如游戏、IM、实时 RPC 里，可能会关闭 Nagle 算法，也就是设置：

```txt
TCP_NODELAY
```

---

## 三、AI 辅助编码怎么回答

这个问题我之前说得不是很清楚，现在我会按实际场景来回答，而不是简单说“我会用 AI 写代码”。

我会这样说：

> 我平时会把 AI 当成辅助工具，不会直接无脑复制。主要用在分析报错、辅助写工具函数、Code Review 和优化文档注释这几类场景。

### 1. 分析报错

比如项目构建失败、类型报错、依赖版本冲突，我会把：

- 错误信息
- 相关代码
- 依赖版本
- 复现步骤
- 我已经尝试过的方法

一起给 AI，让它帮我分析可能原因。

但最后我还是会自己验证，比如查官方文档、跑测试、看日志。

### 2. 辅助写工具函数

比如写一些边界明确的小函数：

- 时间格式化
- 数组分组
- URL 参数解析
- 表单校验
- 请求封装
- 数据转换

我会先告诉 AI 输入输出和边界情况，让它生成初稿。  
然后我会自己补类型、补测试、检查异常情况。

### 3. Code Review

我会让 AI 帮我从这些角度检查：

- 有没有空值问题
- 有没有重复请求
- 异步逻辑有没有竞态
- 状态命名是否清楚
- 函数是否太长
- 有没有性能问题
- 有没有安全风险

但 AI 的建议我不会全部接受，我会结合项目实际判断。

### 4. 优化文档和注释

比如 README、接口文档、复杂函数注释，我会让 AI 帮我把表达整理得更清楚。

这对个人项目也挺有用，因为有时候项目自己能跑，但是文档写得不清楚，别人很难看懂。

面试里可以加一句：

> 涉及鉴权、数据库、支付、隐私数据这些地方，我会更谨慎，不会直接复制 AI 的代码，必须自己验证。

---

## 四、个人项目如何进行技术选型

这个问题不能只说“因为我熟悉”或者“因为好用”。

我觉得比较好的回答方式是从项目需求倒推技术栈。

我会先考虑这些问题：

- 项目是内容展示型还是后台管理型？
- 是否需要 SEO？
- 是否需要登录鉴权？
- 数据关系复杂不复杂？
- 是否主要是 CRUD？
- 是否有实时通信？
- 是否需要文件上传？
- 部署到哪里？
- 后期维护成本怎么样？
- 社区和生态成熟不成熟？

然后再选技术。

比如一个个人项目如果是内容展示 + 登录 + CRUD + 后台管理，我可能会选：

```txt
Next.js + TypeScript + Prisma + PostgreSQL
```

理由是：

- Next.js 适合做 React 全栈应用
- TypeScript 提高代码可维护性
- Prisma 适合类型安全的数据库访问
- PostgreSQL 适合关系型数据存储
- 整体生态比较成熟，开发效率也高

我会这样总结：

> 我做技术选型时不是只看熟不熟，而是先看项目需求。比如是否需要 SEO、数据模型是否复杂、是否需要全栈能力、部署和维护成本能不能接受，然后再结合生态成熟度和开发效率来选择技术栈。

---

## 五、为什么选择 Next.js？

我理解 Next.js 的价值不是“它是 React 框架”这么简单，而是它帮我们把很多 Web 应用常见能力整合好了。

Next.js 提供了：

- 文件路由
- 服务端渲染 SSR
- 静态生成 SSG
- React Server Components
- Route Handler
- 图片优化
- SEO 支持
- 部署支持
- 全栈开发能力

如果项目只是一个纯后台管理系统，用户登录后才能看到页面，也不需要 SEO，那 Vite + React 可能更轻量。

但如果项目需要：

- SEO
- 首屏性能
- 内容展示
- 服务端渲染
- 一些简单后端接口
- 前后端一体开发

那 Next.js 就比较合适。

面试可以这样回答：

> 我选择 Next.js 是因为这个项目不是单纯的前端 SPA，而是一个需要 SEO、首屏性能和一定后端能力的全栈 Web 应用。Next.js 在 React 基础上提供了路由、SSR、SSG、Server Components 和 Route Handler，可以减少很多工程配置，同时也更适合内容型和全栈型项目。

加分点是不要说“所有项目我都用 Next.js”。

可以补一句：

> 如果只是内部后台系统，对 SEO 没要求，我也会考虑 Vite + React，因为它更轻量。

---

## 六、Prisma 有什么竞品？为什么选择 Prisma？

### Prisma 的竞品

Prisma 的竞品可以分几类。

传统 ORM：

- TypeORM
- Sequelize
- MikroORM

SQL Builder：

- Knex
- Kysely

TypeScript 生态里常见的：

- Drizzle ORM

还有一种就是直接写原生 SQL。

---

### 为什么选择 Prisma？

我选择 Prisma 的理由主要是它和 TypeScript 项目比较搭。

Prisma 的工作方式大概是：

1. 在 schema 里定义数据模型
2. 通过 Prisma Migrate 管理数据库迁移
3. 自动生成 Prisma Client
4. 在代码里获得类型安全的数据库查询能力

它比较适合 CRUD 类型项目。

比如查询用户：

```ts
const user = await prisma.user.findUnique({
  where: {
    id: 1,
  },
});
```

字段名、参数类型、返回值都会有类型提示。

这对项目维护很有帮助，尤其是数据表多了之后，手写 SQL 很容易写错字段名，Prisma 可以提前在开发阶段暴露很多问题。

我会这样回答：

> 我选择 Prisma 是因为项目本身以 CRUD 为主，数据关系比较清晰，而且使用 TypeScript。Prisma 通过 schema 生成类型安全的 Client，可以减少数据库访问时的运行时错误，同时 Prisma Migrate 和 Prisma Studio 也能提高开发效率。

但也要说它不是万能的：

> 如果项目里有大量复杂 SQL、报表查询、性能极致优化，我可能不会完全依赖 Prisma，而是会结合 raw SQL、Kysely 或者 Drizzle。

这样回答会比“因为 Prisma 好用”更像是从项目需求出发。

---

## 七、CSS 相关

CSS 这部分看起来基础，但面试真的很常问。尤其是选择器、优先级、盒模型、Flex、Grid、响应式、rem、vw、vh。

---

### 1. CSS 有哪些选择器？

我会按分类来说。

#### 基础选择器

```css
* {}
div {}
.box {}
#app {}
[type="text"] {}
```

分别是：

- 通配符选择器
- 标签选择器
- 类选择器
- ID 选择器
- 属性选择器

#### 关系选择器

```css
.parent .child {}
.parent > .child {}
h1 + p {}
h1 ~ p {}
```

分别是：

- 后代选择器
- 子代选择器
- 相邻兄弟选择器
- 通用兄弟选择器

#### 伪类选择器

```css
:hover
:focus
:active
:nth-child()
:first-child
:last-child
:not()
:has()
```

伪类主要表示元素的状态或结构位置。

#### 伪元素选择器

```css
::before
::after
::first-line
::first-letter
::selection
```

伪元素主要用于选择元素的一部分，或者创建一个虚拟元素。

---

### 2. CSS 优先级

优先级大致是：

```txt
!important
>
行内样式
>
ID 选择器
>
类选择器 / 属性选择器 / 伪类
>
标签选择器 / 伪元素
>
通配符
```

如果优先级一样，就后写的覆盖先写的。

面试时可以说：

> CSS 优先级主要看选择器权重，ID 高于类，类高于标签。同权重情况下后面的规则覆盖前面的规则，`!important` 会提升优先级，但实际项目里不建议滥用。

---

### 3. CSS 怎么实现复杂布局？

我现在会先判断是一维布局还是二维布局。

#### Flex

Flex 更适合一维布局，比如横向或纵向排列。

常用属性：

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
```

适合：

- 导航栏
- 按钮组
- 垂直居中
- 横向列表
- 表单项排列

#### Grid

Grid 更适合二维布局，也就是同时控制行和列。

比如卡片网格：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

响应式卡片布局可以写成：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}
```

这样屏幕宽的时候一行多个卡片，屏幕窄的时候自动换行。

我的总结是：

> Flex 适合一维布局，Grid 适合二维布局。复杂页面通常是 Grid 做整体结构，Flex 做局部对齐。

---

### 4. rem 是什么？有什么作用？

`rem` 是 CSS 的相对单位，相对于根元素 `html` 的字体大小。

默认情况下：

```txt
html font-size = 16px
1rem = 16px
2rem = 32px
0.5rem = 8px
```

它和 `em` 的区别是：

- `em` 相对于当前元素或父元素
- `rem` 相对于根元素 html

所以 `rem` 更稳定，适合做全局字号、间距、响应式布局。

比如：

```css
.card {
  padding: 1.5rem;
  border-radius: 1rem;
}

.title {
  font-size: 2rem;
}
```

现在也可以配合 `clamp()`：

```css
h1 {
  font-size: clamp(2rem, 5vw, 4rem);
}
```

它的意思是字体最小 `2rem`，最大 `4rem`，中间根据视口宽度变化。

面试可以这样说：

> rem 是相对于 html 根元素字体大小的单位，比 em 更统一，适合做全局尺寸和响应式适配。实际项目中可以结合媒体查询、vw、clamp 等方式实现更灵活的响应式布局。

---

## 八、JS / 浏览器相关

### 1. JS 是单线程的，为什么异步任务不会阻塞主线程？

这个问题我一开始容易答成“因为有事件循环”，但其实要说完整一点。

JavaScript 主线程确实是单线程的，也就是说同一时间只能执行一个调用栈里的任务。

但是浏览器不是只有 JS 引擎。浏览器还提供了很多 Web API，比如：

- setTimeout
- DOM 事件
- fetch
- XMLHttpRequest
- IntersectionObserver
- Web Worker

当我们执行：

```js
setTimeout(() => {
  console.log('timer');
}, 1000);
```

JS 主线程不会在那里等 1 秒，而是把定时器交给浏览器环境，然后继续执行后面的代码。

等时间到了，回调会进入任务队列。等调用栈清空后，事件循环再把队列里的任务拿出来执行。

fetch 也是类似，网络请求等待过程不是 JS 主线程在等。

所以异步不会阻塞主线程，是因为等待过程交给了宿主环境。  
但回调真正执行的时候，还是会回到 JS 主线程。

所以如果回调里写了大量同步计算，页面还是会卡。

面试可以这样说：

> JS 是单线程指的是 JS 执行栈是单线程，但浏览器提供了 Web API 来处理定时器、网络请求、事件监听等异步任务。异步任务完成后，回调会进入任务队列，等调用栈为空时再通过事件循环执行。所以等待过程不会阻塞主线程，但回调执行时仍然会占用主线程。

---

### 2. FCP、LCP、INP、CLS 是什么？

这几个是性能优化里常问的指标。

先说一个容易混的点：  
现在常说的 Core Web Vitals 主要是：

- LCP
- INP
- CLS

FCP 是常用性能指标，但不属于现在核心的三大 Core Web Vitals。

---

#### FCP

FCP 是 First Contentful Paint，首次内容绘制。

它表示页面从开始加载到第一个文本、图片、SVG 或非空白内容出现的时间。

通俗点说：

> 用户什么时候第一次看到页面有东西，而不是白屏。

优化方式：

- 减少阻塞 CSS
- 减少阻塞 JS
- 优化首屏资源
- 使用 SSR / SSG
- 使用缓存

---

#### LCP

LCP 是 Largest Contentful Paint，最大内容绘制。

它表示首屏视口里最大的内容元素完成渲染的时间。

这个元素可能是：

- 大图
- banner
- 主标题
- 主要内容块

通俗点说：

> 用户什么时候看到页面的主要内容。

优化方式：

- 优化首屏图片
- 图片压缩
- CDN
- 预加载关键资源
- SSR / SSG
- 减少服务端响应时间

---

#### INP

INP 是 Interaction to Next Paint。

它表示用户交互之后，到页面下一次视觉更新之间的延迟。

比如用户点击按钮、输入内容、切换 Tab，页面多久有反馈。

通俗点说：

> 用户点了页面以后，页面多久有反应。

优化方式：

- 减少长任务
- 拆分 JS
- 优化事件处理函数
- 避免主线程阻塞
- 减少不必要的重渲染
- 必要时使用 Web Worker

---

#### CLS

CLS 是 Cumulative Layout Shift，累计布局偏移。

比如页面加载时图片没有设置宽高，图片加载出来后把下面文字挤下去，这就会造成布局偏移。

通俗点说：

> 页面内容不要突然乱跳。

优化方式：

- 图片设置 width / height
- 广告位预留空间
- 动态内容不要突然插在已有内容上方
- 字体加载优化
- 使用骨架屏预占位

---

#### 指标阈值

大概可以这样记：

| 指标 | 较好标准 |
|---|---|
| FCP | 1.8 秒以内 |
| LCP | 2.5 秒以内 |
| INP | 200ms 以内 |
| CLS | 0.1 以内 |

---

### 3. 闭包

闭包这个概念我觉得可以先说得简单一点：

> 闭包就是函数可以访问它定义时所在作用域里的变量，即使外层函数已经执行完了。

比如：

```js
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
```

`createCounter` 执行完之后，按理说 `count` 应该被销毁。  
但是返回的内部函数还引用着 `count`，所以它不会被释放。

这个就是闭包。

闭包常见用途：

- 封装私有变量
- 实现计数器
- 防抖节流
- 缓存
- 函数柯里化
- 模块化

但闭包也有风险。  
如果闭包引用了很大的对象，而且一直不释放，可能会导致内存占用变高。

还有一个经典问题是 `var` 循环：

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}

// 输出 3 3 3
```

因为 `var` 没有块级作用域，三个回调共享同一个 `i`。

用 `let` 就可以解决：

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}

// 输出 0 1 2
```

面试可以这样说：

> 闭包是函数和它定义时的词法作用域组成的结构。内部函数即使在外部函数执行结束后，仍然可以访问外部函数里的变量。它常用于封装私有变量、缓存、防抖节流等场景，但如果长期持有不需要的变量，也可能造成内存无法释放。

---

## 九、React 异步请求代码题

这道题是一个比较典型的前端异步请求题。

题目大概是：

现在有两个异步方法：

```ts
getToken()
// 返回 token 字符串

getUserInfo(token)
// 入参 token
// 返回用户信息
// {
//   id: 1,
//   name: '张三',
//   avatar: '头像地址'
// }
```

要求：

1. 页面加载时先调用 `getToken`
2. 拿到 token 后，再调用 `getUserInfo(token)`
3. 页面展示加载中、用户昵称、用户头像、错误状态
4. 不能在没有 token 的情况下调用 `getUserInfo`
5. 尽量避免重复请求
6. 不要最小实现，要完成可视化验证

---

### 1. 我的解题思路

这题表面看起来很简单：

```ts
const token = await getToken();
const user = await getUserInfo(token);
```

但如果只是这样写，其实不够完整。

因为真正项目里还要考虑：

- loading 状态怎么展示
- token 请求失败怎么办
- userInfo 请求失败怎么办
- token 为空时怎么阻止后续请求
- React 开发环境 StrictMode 可能导致 effect 重复执行
- 怎么避免重复请求
- 怎么做重试
- 怎么证明没有重复请求
- 怎么可视化展示当前请求流程

所以我会把它做成一个完整页面，而不是只写一个最小 demo。

---

### 2. 推荐目录结构

如果是 Next.js App Router 项目，可以这样放：

```txt
src/app/interview-token-user/
  page.tsx
  page.module.css
  mock-user-api.ts
  token-user-resource.ts
```

访问路径：

```txt
/interview-token-user
```

---

### 3. mock-user-api.ts

这个文件模拟接口，并统计请求次数。

```ts
export type UserInfo = {
  id: number;
  name: string;
  avatar: string;
};

export type FailureStage = 'none' | 'token' | 'userInfo';

let failureStage: FailureStage = 'none';

const requestStats = {
  tokenRequestCount: 0,
  userInfoRequestCount: 0,
  lastTokenUsed: '',
};

export function setMockFailureStage(stage: FailureStage) {
  failureStage = stage;
}

export function getMockRequestStats() {
  return { ...requestStats };
}

export function resetMockRequestStats() {
  requestStats.tokenRequestCount = 0;
  requestStats.userInfoRequestCount = 0;
  requestStats.lastTokenUsed = '';
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function getToken(): Promise<string> {
  requestStats.tokenRequestCount += 1;

  await sleep(800);

  if (failureStage === 'token') {
    throw new Error('getToken 调用失败：模拟 token 接口异常');
  }

  return `mock_token_${Date.now()}`;
}

export async function getUserInfo(token: string): Promise<UserInfo> {
  requestStats.userInfoRequestCount += 1;
  requestStats.lastTokenUsed = token || '';

  if (!token) {
    throw new Error('getUserInfo 被错误调用：token 为空');
  }

  await sleep(900);

  if (failureStage === 'userInfo') {
    throw new Error('getUserInfo 调用失败：模拟用户信息接口异常');
  }

  return {
    id: 1,
    name: '张三',
    avatar: '头像地址',
  };
}
```

这里我特意加了：

- 请求次数统计
- 最后一次使用的 token
- token 失败模拟
- userInfo 失败模拟

这样页面上就可以直接验证请求顺序和请求次数。

---

### 4. token-user-resource.ts

这个文件是为了避免重复请求。

核心思路是：

- 如果 token 已经有缓存，直接返回
- 如果 token 请求正在进行，复用同一个 promise
- userInfo 按 token 缓存
- 没有 token 时直接报错，不允许请求 userInfo

```ts
import { getToken, getUserInfo, type UserInfo } from './mock-user-api';

let tokenCache: string | null = null;
let tokenPending: Promise<string> | null = null;

const userCacheByToken = new Map<string, UserInfo>();
const userPendingByToken = new Map<string, Promise<UserInfo>>();

export function clearTokenUserCache() {
  tokenCache = null;
  tokenPending = null;
  userCacheByToken.clear();
  userPendingByToken.clear();
}

export async function getTokenOnce(options: { force?: boolean } = {}) {
  const { force = false } = options;

  if (force) {
    clearTokenUserCache();
  }

  if (tokenCache) {
    return tokenCache;
  }

  if (tokenPending) {
    return tokenPending;
  }

  tokenPending = getToken()
    .then((token) => {
      if (!token) {
        throw new Error('getToken 返回为空，不能继续调用 getUserInfo');
      }

      tokenCache = token;
      return token;
    })
    .finally(() => {
      tokenPending = null;
    });

  return tokenPending;
}

export async function getUserInfoOnce(token: string) {
  if (!token) {
    throw new Error('没有 token，禁止调用 getUserInfo');
  }

  const cachedUser = userCacheByToken.get(token);

  if (cachedUser) {
    return cachedUser;
  }

  const pendingUser = userPendingByToken.get(token);

  if (pendingUser) {
    return pendingUser;
  }

  const request = getUserInfo(token)
    .then((user) => {
      userCacheByToken.set(token, user);
      return user;
    })
    .finally(() => {
      userPendingByToken.delete(token);
    });

  userPendingByToken.set(token, request);

  return request;
}
```

我觉得这段里最关键的是：

```ts
if (!token) {
  throw new Error('没有 token，禁止调用 getUserInfo');
}
```

这能保证题目要求的：

```txt
不能在没有 token 的情况下调用 getUserInfo
```

还有这一段：

```ts
if (tokenPending) {
  return tokenPending;
}
```

它能避免请求已经发出但还没返回时，又重复发起一次请求。

---

### 5. 页面状态怎么设计

我会把页面状态拆成几个明确状态：

```ts
type PageStatus =
  | 'idle'
  | 'loading-token'
  | 'loading-user'
  | 'success'
  | 'error';
```

正常流程是：

```txt
idle
 ↓
loading-token
 ↓
loading-user
 ↓
success
```

异常流程是：

```txt
loading-token -> error
loading-user  -> error
```

这样比只用一个 `loading: boolean` 更清楚，因为它能区分当前到底是在拿 token，还是在拿用户信息。

---

### 6. 页面上应该展示什么

为了达到“可视化验证”，页面上最好展示：

- 当前状态
- 是否正在获取 token
- 是否正在获取用户信息
- 用户头像
- 用户昵称
- 错误信息
- getToken 请求次数
- getUserInfo 请求次数
- getUserInfo 实际使用的 token
- 当前页面 token
- 模拟 getToken 失败
- 模拟 getUserInfo 失败
- 重新请求按钮
- 重置按钮

这样面试官或者自己验证时，可以很直观看到：

- token 失败时，userInfo 没有被调用
- userInfo 一定是在 token 之后调用
- 请求次数没有异常增加
- 错误状态可以展示
- 成功后可以展示用户信息

---

### 7. 面试时怎么讲这道题

我会这样讲：

> 这道题的重点不是简单写两个 await，而是处理好异步依赖、状态管理、错误处理和重复请求问题。我的实现是页面加载后先进入 loading-token 状态，调用 getToken。拿到 token 后才进入 loading-user 状态并调用 getUserInfo(token)。如果 token 为空，会直接抛错，不会继续请求用户信息。任意一步失败都会进入 error 状态，成功后展示用户昵称和头像。

然后再补充：

> 为了避免重复请求，我把请求逻辑单独封装了一层，用 tokenCache 和 tokenPending 缓存 token 请求；用户信息则按 token 做缓存和 pending promise 复用。这样即使 React 开发环境 StrictMode 导致 effect 执行检查，也不会真的重复发起接口请求。

最后说可视化验证：

> 页面上我会展示 getToken 和 getUserInfo 的请求次数、当前 token、最后一次 getUserInfo 使用的 token，还提供 token 失败和 userInfo 失败的模拟选项。这样可以直接验证请求顺序、错误状态以及无 token 不请求 userInfo。

---

## 十、最后总结

这次复习下来，我感觉很多面试题不是“不知道”，而是“知道一点但说不成体系”。

比如 WebSocket，不能只说“长连接”，还要能说出 HTTP Upgrade、TCP、frame、心跳、重连。

比如 TCP，不能只背“三次握手四次挥手”，还要知道为什么是三次、为什么是四次、TIME_WAIT 和 CLOSE_WAIT 分别意味着什么。

比如项目技术选型，不能只说“因为熟悉”或者“因为好用”，而是要从项目需求出发，说清楚为什么这个项目适合 Next.js、为什么 Prisma 比其他方案更符合当前需求。

比如 React 异步请求题，不能只写最简单的两个 await，而是要体现真实项目里的状态管理、错误处理、重复请求控制和可视化验证。

我现在会用这个思路准备面试答案：

```txt
先说定义
再说原理
再说场景
最后结合项目经验或注意点
```

比如：

> WebSocket 是全双工长连接协议。它先通过 HTTP Upgrade 握手，然后基于 TCP 长连接传输 WebSocket frame。适合聊天、通知、实时数据推送等场景。实际项目中还要处理鉴权、心跳、断线重连和连接数压力。

再比如：

> Prisma 适合 TypeScript + CRUD 为主的项目，因为它可以通过 schema 生成类型安全的 Client，并且有迁移和可视化工具。但如果项目有大量复杂 SQL，我也会结合 raw SQL、Kysely 或 Drizzle。

这样回答会比单纯背概念自然很多，也更像是真的做过项目、思考过技术选型。

---

## 面试前速记

最后放一版我自己面试前会快速看的关键词。

### 网络

```txt
WebSocket = HTTP Upgrade + TCP 长连接 + 双向通信 + frame
MQTT = 轻量发布订阅协议，适合 IoT
RabbitMQ = 消息中间件，适合异步解耦和任务队列
HTTP 请求链路 = URL → DNS → TCP/TLS → HTTP 报文 → Nginx/Web Server → 路由 → 业务代码 → 响应
```

### TCP

```txt
TCP = 面向连接 + 可靠 + 有序 + 字节流 + 全双工

三次握手：
SYN → SYN+ACK → ACK

四次挥手：
FIN → ACK → FIN → ACK

可靠传输：
序列号、ACK、重传、滑动窗口、流量控制、拥塞控制、校验和

流量控制：
防止接收方被打爆，看 rwnd

拥塞控制：
防止网络被打爆，看 cwnd

粘包：
TCP 是字节流，没有消息边界

TIME_WAIT：
保证最后 ACK，清理历史报文

CLOSE_WAIT：
程序没有正确 close
```

### 项目选型

```txt
不要只说熟悉。
从需求出发：
SEO、首屏性能、登录鉴权、CRUD、数据关系、部署、维护成本、生态成熟度。
```

### Next.js

```txt
适合需要 SEO、SSR/SSG、全栈能力、内容展示和路由约定的 React 项目。
纯后台系统可以考虑 Vite + React。
```

### Prisma

```txt
竞品：
TypeORM、Sequelize、MikroORM、Drizzle、Kysely、Knex、原生 SQL

选择理由：
TypeScript 类型安全、schema 驱动、自动生成 Client、迁移方便、开发效率高。
```

### CSS

```txt
选择器：
标签、类、ID、属性、关系、伪类、伪元素

优先级：
!important > 行内 > ID > 类/属性/伪类 > 标签/伪元素

Flex：
一维布局

Grid：
二维布局

rem：
相对于 html 根元素字体大小，适合统一缩放和响应式
```

### JS / 浏览器

```txt
JS 单线程指的是执行栈单线程。
异步等待交给浏览器 Web API 或 Node 底层。
回调通过事件循环回到主线程。

FCP：
首次内容绘制

LCP：
最大内容绘制

INP：
交互到下一次绘制延迟

CLS：
累计布局偏移

闭包：
函数 + 它能访问的词法作用域
```

### React 异步题

```txt
页面加载
 ↓
getToken
 ↓
token 存在
 ↓
getUserInfo(token)
 ↓
展示用户信息

必须处理：
loading
success
error
无 token 不请求 userInfo
避免重复请求
请求次数可视化
错误模拟
重试
缓存和 pending promise
```

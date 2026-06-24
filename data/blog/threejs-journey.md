---
title: Three.js 学习笔记：从入门到第一个场景
date: 2026-06-03
excerpt: 记录我学习 Three.js 的过程，以及如何在 React 中优雅地使用 3D 渲染。
---

# Three.js 学习笔记：从入门到第一个场景

记录我学习 Three.js 的过程，以及在 React 中优雅使用 3D 渲染的实践。

## 为什么选择 React Three Fiber？

过去在 React 中使用 Three.js 是一件比较痛苦的事情——你需要手动管理 canvas、scene、renderer，还要处理 React 生命周期和 Three.js 对象的同步。

**React Three Fiber (R3F)** 解决了这些问题：

- 用声明式 JSX 描述 3D 场景
- 自动处理 mount/unmount
- 完美融入 React 生态（状态管理、事件处理）
- `@react-three/drei` 提供了大量开箱即用的工具

## 一个简单的场景

```tsx
<Canvas>
  <ambientLight intensity={0.5} />
  <spotLight position={[10, 10, 10]} />
  <mesh>
    <boxGeometry />
    <meshStandardMaterial color="hotpink" />
  </mesh>
</Canvas>
```

这就是在 React 中创建一个旋转立方体所需的全部代码。

## 下一步

接下来我计划探索：

1. 模型加载（GLTF/GLB）
2. 交互式动画
3. 后期处理效果
4. 性能优化技巧

Stay tuned!

# Vue Hero Cross

一个用于Vue 3的平滑跨组件Hero动画指令库。

## 特性

- 🚀 支持Vue 3
- ✨ 平滑的跨组件动画过渡
- 🎯 简单易用的指令语法
- 📱 响应式设计支持
- 🎨 可自定义动画参数

## 安装

```bash
npm install vue-hero-cross
```

## 🔨 使用

### 1. 全局注册（推荐）

```ts
// main.ts
import { createApp } from 'vue'
import VueHero from 'vue-hero-cross'

createApp(App).use(VueHero).mount('#app')
```

### 2. 局部使用

```vue
<script setup>
import { vHero } from 'vue-hero-cross'
</script>

<template>
  <!-- 给任意元素加上 v-hero 指令即可 -->
  <img v-hero:myId src="./logo.png" />
</template>
```

### 3. 触发过渡

```vue
<!-- 列表页 -->
<img v-hero:myId src="./logo.png" @click="goDetail" />

<!-- 详情页 -->
<img v-hero:myId src="./logo.png" />
```

当路由从列表页跳转到详情页时，两个 `v-hero:myId` 会自动执行 Hero 动画，无需手动计算坐标。

---

## 使用示例

```vue
<!-- 源元素 -->
<div v-hero="{ id: 'my-animation' }">内容</div>

<!-- 目标元素 -->
<div v-hero="{ id: 'my-animation' }">内容</div>
```

## ⚙️ API

| 指令参数 | 类型   | 默认值 | 说明 |
| -------- | ------ | ------ | ---- |
| `id` | `string` | - | 必填，同一过渡的唯一标识 |
| `duration`  | `number` | 300 | 动画时长（ms） |
| `easing`    | `string` | `ease-out` | 任何 CSS easing 或 cubic-bezier |
| `delay`     | `number` | 0 | 延迟 |
| `position`  | `'absolute' \| 'fixed'` | `absolute` | 动画期间定位方式 |
| `zIndex`    | `number` | 999 | 动画层 z-index |

## 许可证

MIT
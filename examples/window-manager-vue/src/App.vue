<script setup lang="ts">
import { ref, onMounted } from 'vue';

const windowId = ref<number | null>(null);
const windowBounds = ref<{
  x: number;
  y: number;
  width: number;
  height: number;
} | null>(null);

onMounted(async () => {
  const result = await window.windowManager.getWindowInfo({
    isBounds: true,
  });
  console.log(result);
  windowId.value = result.id ?? null;
  windowBounds.value = result.bounds ?? null;
});

const createNewWindow = async () => {
  const newWindowId = await window.windowManager.createWindow({
    width: 768,
    height: 500,
    title: '新窗口',
    show: true,
  });
  console.log('新窗口创建成功，ID:', newWindowId);
};

const toggleMaximize = async () => {
  if (windowId.value) {
    await window.windowManager.toggleMaximizeWindow(windowId.value);
  }
};

const minimize = async () => {
  if (windowId.value) {
    await window.windowManager.minimizeWindow(windowId.value);
  }
};

const close = async () => {
  if (windowId.value) {
    await window.windowManager.closeWindow(windowId.value);
  }
};
</script>

<template>
  <div class="container">
    <h1>Window Manager 示例</h1>

    <div class="info">
      <p>当前窗口 ID: {{ windowId }}</p>
      <p v-if="windowBounds">
        窗口位置: ({{ windowBounds.x }}, {{ windowBounds.y }})<br />
        窗口大小: {{ windowBounds.width }} x {{ windowBounds.height }}
      </p>
    </div>

    <div class="controls">
      <button @click="createNewWindow">创建新窗口</button>
      <button @click="toggleMaximize">切换最大化</button>
      <button @click="minimize">最小化</button>
      <button @click="close">关闭窗口</button>
    </div>
  </div>
</template>

<style scoped>

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
}

.info {
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.info p {
  margin: 0.5rem 0;
  color: #666;
}

.controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem 0;
}

.controls button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #646cff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.controls button:hover {
  background-color: #535bf2;
}

.menu-controls {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #e9e9e9;
  border-radius: 8px;
}

.menu-controls h2 {
  margin-bottom: 1rem;
  color: #333;
}

.menu-controls button {
  margin: 0 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-controls button:hover {
  background-color: #45a049;
}
</style>

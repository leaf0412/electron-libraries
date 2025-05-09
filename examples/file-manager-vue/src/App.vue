<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

const currentPath = ref('');
const files = ref<FileInfo[]>([]);
const error = ref('');
const newFileName = ref('');
const newDirName = ref('');
const fileContent = ref('');
const showFileContent = ref(false);
const initialPath = ref('');

// 读取目录
const readDirectory = async (path: string) => {
  try {
    files.value = await window.fileManager.readDirectory(path);
    currentPath.value = path;
    error.value = '';
  } catch (err) {
    error.value = `读取目录失败: ${err}`;
  }
};

// 创建文件
const createFile = async () => {
  if (!newFileName.value) return;
  try {
    const filePath = `${currentPath.value}/${newFileName.value}`;
    await window.fileManager.createFile(filePath);
    await readDirectory(currentPath.value);
    newFileName.value = '';
    error.value = '';
  } catch (err) {
    error.value = `创建文件失败: ${err}`;
  }
};

// 创建目录
const createDirectory = async () => {
  if (!newDirName.value) return;
  try {
    const dirPath = `${currentPath.value}/${newDirName.value}`;
    await window.fileManager.createDirectory(dirPath);
    await readDirectory(currentPath.value);
    newDirName.value = '';
    error.value = '';
  } catch (err) {
    error.value = `创建目录失败: ${err}`;
  }
};

// 复制文件或目录
const copyItem = async (sourcePath: string, destinationPath: string) => {
  try {
    await window.fileManager.copyFile(sourcePath, destinationPath);
    await readDirectory(currentPath.value);
    error.value = '';
  } catch (err) {
    error.value = `复制失败: ${err}`;
  }
};

// 移动文件或目录
const moveItem = async (sourcePath: string, destinationPath: string) => {
  try {
    await window.fileManager.moveFile(sourcePath, destinationPath);
    await readDirectory(currentPath.value);
    error.value = '';
  } catch (err) {
    error.value = `移动失败: ${err}`;
  }
};

// 删除文件或目录
const deleteItem = async (path: string) => {
  try {
    await window.fileManager.deleteFile(path);
    await readDirectory(currentPath.value);
    error.value = '';
  } catch (err) {
    error.value = `删除失败: ${err}`;
  }
};

// 获取文件信息
const getFileInfo = async (path: string) => {
  try {
    const info = await window.fileManager.getFileInfo(path);
    console.log('File info:', info);
    error.value = '';
  } catch (err) {
    error.value = `获取文件信息失败: ${err}`;
  }
};

// 检查文件或目录是否存在
const checkExists = async (path: string) => {
  try {
    const exists = await window.fileManager.existsFile(path);
    console.log('File exists:', exists);
    error.value = '';
  } catch (err) {
    error.value = `检查文件存在失败: ${err}`;
  }
};

// 返回上一级目录
const goToParentDirectory = () => {
  const parentPath = currentPath.value.split('/').slice(0, -1).join('/');
  if (parentPath) {
    readDirectory(parentPath);
  }
};

// 读取文件内容
const readFileContent = async (path: string) => {
  try {
    const content = await window.fileManager.readFile(path);
    fileContent.value = content;
    showFileContent.value = true;
    error.value = '';
  } catch (err) {
    error.value = `读取文件内容失败: ${err}`;
  }
};

onMounted(() => {});
</script>

<template>
  <div class="file-manager">
    <div class="header">
      <h1>文件管理器</h1>
      <div v-if="!currentPath" class="initial-path-input">
        <input
          v-model="initialPath"
          placeholder="请输入初始路径"
          @keyup.enter="readDirectory(initialPath)"
        />
        <button @click="readDirectory(initialPath)">进入目录</button>
      </div>
      <div v-else class="current-path">
        当前路径: {{ currentPath }}
        <button class="parent-dir-btn" @click="goToParentDirectory">
          返回上级
        </button>
      </div>
    </div>

    <div class="error" v-if="error">{{ error }}</div>

    <div class="actions">
      <div class="create-section">
        <input v-model="newFileName" placeholder="新文件名" />
        <button @click="createFile">创建文件</button>
        <input v-model="newDirName" placeholder="新目录名" />
        <button @click="createDirectory">创建目录</button>
      </div>
    </div>

    <div class="file-list">
      <div v-for="file in files" :key="file.path" class="file-item">
        <span class="file-icon">{{ file.isDirectory ? '📁' : '📄' }}</span>
        <span
          class="file-name"
          @click="
            file.isDirectory
              ? readDirectory(file.path)
              : readFileContent(file.path)
          "
        >
          {{ file.name }}
        </span>
        <div class="file-actions">
          <button
            @click="copyItem(file.path, `${currentPath}/copy_${file.name}`)"
          >
            复制
          </button>
          <button
            @click="moveItem(file.path, `${currentPath}/moved_${file.name}`)"
          >
            移动
          </button>
          <button @click="deleteItem(file.path)">删除</button>
          <button @click="checkExists(file.path)">检查</button>
        </div>
      </div>
    </div>

    <div v-if="showFileContent" class="file-content-modal">
      <div class="file-content-container">
        <div class="file-content-header">
          <h3>文件内容</h3>
          <button @click="showFileContent = false">关闭</button>
        </div>
        <pre class="file-content">{{ fileContent }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.file-manager {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 20px;
}

.current-path {
  color: #666;
  margin-top: 10px;
}

.error {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background-color: #ffeeee;
  border-radius: 4px;
}

.actions {
  margin-bottom: 20px;
}

.create-section {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.file-list {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.file-item:last-child {
  border-bottom: none;
}

.file-icon {
  margin-right: 10px;
  font-size: 1.2em;
}

.file-name {
  flex: 1;
  cursor: pointer;
}

.file-name:hover {
  color: #4caf50;
}

.file-actions {
  display: flex;
  gap: 5px;
}

.file-actions button {
  padding: 4px 8px;
  font-size: 0.9em;
}

.parent-dir-btn {
  margin-left: 10px;
  background-color: #2196f3;
}

.parent-dir-btn:hover {
  background-color: #1976d2;
}

.file-content-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.file-content-container {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.file-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.file-content {
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
  overflow: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: calc(80vh - 100px);
}

.initial-path-input {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  align-items: center;
}

.initial-path-input input {
  flex: 1;
  max-width: 500px;
}
</style>

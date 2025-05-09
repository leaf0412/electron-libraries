import { useState } from 'react'
import './App.css'

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedTime: Date;
  createdTime: Date;
}

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [error, setError] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [showFileContent, setShowFileContent] = useState(false);
  const [initialPath, setInitialPath] = useState('');

  // 读取目录
  const readDirectory = async (path: string) => {
    try {
      const fileList = await window.fileManager.readDirectory(path);
      setFiles(fileList);
      setCurrentPath(path);
      setError('');
    } catch (err) {
      setError(`读取目录失败: ${err}`);
    }
  };

  // 创建文件
  const createFile = async () => {
    if (!newFileName) return;
    try {
      const filePath = `${currentPath}/${newFileName}`;
      await window.fileManager.createFile(filePath);
      await readDirectory(currentPath);
      setNewFileName('');
      setError('');
    } catch (err) {
      setError(`创建文件失败: ${err}`);
    }
  };

  // 创建目录
  const createDirectory = async () => {
    if (!newDirName) return;
    try {
      const dirPath = `${currentPath}/${newDirName}`;
      await window.fileManager.createDirectory(dirPath);
      await readDirectory(currentPath);
      setNewDirName('');
      setError('');
    } catch (err) {
      setError(`创建目录失败: ${err}`);
    }
  };

  // 复制文件或目录
  const copyItem = async (sourcePath: string, destinationPath: string) => {
    try {
      await window.fileManager.copyFile(sourcePath, destinationPath);
      await readDirectory(currentPath);
      setError('');
    } catch (err) {
      setError(`复制失败: ${err}`);
    }
  };

  // 移动文件或目录
  const moveItem = async (sourcePath: string, destinationPath: string) => {
    try {
      await window.fileManager.moveFile(sourcePath, destinationPath);
      await readDirectory(currentPath);
      setError('');
    } catch (err) {
      setError(`移动失败: ${err}`);
    }
  };

  // 删除文件或目录
  const deleteItem = async (path: string) => {
    try {
      await window.fileManager.deleteFile(path);
      await readDirectory(currentPath);
      setError('');
    } catch (err) {
      setError(`删除失败: ${err}`);
    }
  };

  // 检查文件或目录是否存在
  const checkExists = async (path: string) => {
    try {
      const exists = await window.fileManager.existsFile(path);
      console.log('File exists:', exists);
      setError('');
    } catch (err) {
      setError(`检查文件存在失败: ${err}`);
    }
  };

  // 返回上一级目录
  const goToParentDirectory = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    if (parentPath) {
      readDirectory(parentPath);
    }
  };

  // 读取文件内容
  const readFileContent = async (path: string) => {
    try {
      const content = await window.fileManager.readFile(path);
      setFileContent(content);
      setShowFileContent(true);
      setError('');
    } catch (err) {
      setError(`读取文件内容失败: ${err}`);
    }
  };

  return (
    <div className="file-manager">
      <div className="header">
        <h1>文件管理器</h1>
        {!currentPath ? (
          <div className="initial-path-input">
            <input
              value={initialPath}
              onChange={(e) => setInitialPath(e.target.value)}
              placeholder="请输入初始路径"
              onKeyUp={(e) => e.key === 'Enter' && readDirectory(initialPath)}
            />
            <button onClick={() => readDirectory(initialPath)}>进入目录</button>
          </div>
        ) : (
          <div className="current-path">
            当前路径: {currentPath}
            <button className="parent-dir-btn" onClick={goToParentDirectory}>
              返回上级
            </button>
          </div>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="actions">
        <div className="create-section">
          <input
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="新文件名"
          />
          <button onClick={createFile}>创建文件</button>
          <input
            value={newDirName}
            onChange={(e) => setNewDirName(e.target.value)}
            placeholder="新目录名"
          />
          <button onClick={createDirectory}>创建目录</button>
        </div>
      </div>

      <div className="file-list">
        {files.map((file) => (
          <div key={file.path} className="file-item">
            <span className="file-icon">{file.isDirectory ? '📁' : '📄'}</span>
            <span
              className="file-name"
              onClick={() =>
                file.isDirectory
                  ? readDirectory(file.path)
                  : readFileContent(file.path)
              }
            >
              {file.name}
            </span>
            <div className="file-actions">
              <button
                onClick={() =>
                  copyItem(file.path, `${currentPath}/copy_${file.name}`)
                }
              >
                复制
              </button>
              <button
                onClick={() =>
                  moveItem(file.path, `${currentPath}/moved_${file.name}`)
                }
              >
                移动
              </button>
              <button onClick={() => deleteItem(file.path)}>删除</button>
              <button onClick={() => checkExists(file.path)}>检查</button>
            </div>
          </div>
        ))}
      </div>

      {showFileContent && (
        <div className="file-content-modal">
          <div className="file-content-container">
            <div className="file-content-header">
              <h3>文件内容</h3>
              <button onClick={() => setShowFileContent(false)}>关闭</button>
            </div>
            <pre className="file-content">{fileContent}</pre>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

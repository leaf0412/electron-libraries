import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [windowId, setWindowId] = useState<number | null>(null);
  const [windowBounds, setWindowBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    // 获取当前窗口 ID
    window.windowManager
      .getWindowInfo({
        isBounds: true,
      })
      .then(result => {
        console.log(result);
        const { id, bounds } = result;
        setWindowId(id ?? null);
        setWindowBounds(bounds ?? null);
      });
  }, []);

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
    if (windowId) {
      await window.windowManager.toggleMaximizeWindow(windowId);
    }
  };

  const minimize = async () => {
    if (windowId) {
      await window.windowManager.minimizeWindow(windowId);
    }
  };

  const close = async () => {
    if (windowId) {
      await window.windowManager.closeWindow(windowId);
    }
  };

  return (
    <div className='container'>
      <h1>Window Manager 示例</h1>

      <div className='info'>
        <p>当前窗口 ID: {windowId}</p>
        {windowBounds && (
          <p>
            窗口位置: ({windowBounds.x}, {windowBounds.y})<br />
            窗口大小: {windowBounds.width} x {windowBounds.height}
          </p>
        )}
      </div>

      <div className='controls'>
        <button onClick={createNewWindow}>创建新窗口</button>
        <button onClick={toggleMaximize}>切换最大化</button>
        <button onClick={minimize}>最小化</button>
        <button onClick={close}>关闭窗口</button>
      </div>
    </div>
  );
}

export default App;

const { app, BrowserWindow } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 820,
    title: '绩效管理系统 Demo',
    webPreferences: {
      nodeIntegration: false
    }
  })

  // Load built H5 files directly
  const indexPath = path.join(__dirname, '..', 'dist', 'build', 'h5', 'index.html')
  mainWindow.loadFile(indexPath)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

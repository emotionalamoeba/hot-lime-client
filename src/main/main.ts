import path from 'path'
import { format } from 'url'
import { app, BrowserWindow, ipcMain, nativeTheme, session } from 'electron'
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS
} from 'electron-devtools-installer'
import { is } from 'electron-util'
import HotlineSession, { Parameter } from './hotlineSession'

import Store from 'electron-store'
import { KeyValuePair } from 'src/shared/KeyValuePair'
import ServerToClientEventListener from 'src/shared/types/ServerToClientEvents'
import { MessageUpdate, UserListUpdate } from 'src/shared/types/APITypes'

const store = new Store();


let win: BrowserWindow | null = null

let hotlineSession: HotlineSession = new HotlineSession(store);

async function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 820,
    minHeight: 600,
    minWidth: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      devTools: true,
    },
    show: false,
    icon: path.join(__dirname, '/assets/icon.icns')
  });

  const isDev = is.development

  if (isDev) {
    win.loadURL('http://localhost:9080')
  } else {
    win.loadURL(
      format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      }),
    )
  }

  win.on('closed', () => {
    win = null
  })

  win.webContents.on('devtools-opened', () => {
    win!.focus()
  })

  win.on('ready-to-show', () => {
    win!.show()
    win!.focus()
    nativeTheme.themeSource = 'dark'

    if (isDev) {
      win!.webContents.openDevTools({ mode: 'bottom' })
    }
  })
}

app.whenReady().then(() => {
  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
}).then(() => {
  if (win === null && app.isReady()) {
    createWindow()
  }
});

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit()
  }
})

ipcMain.handle('connection:connect', () => {
  return hotlineSession.connect(store.get('serverAddress', '') as string);
})

ipcMain.handle('connection:login', (args, username: string) => {
  return hotlineSession.login(username);
})

ipcMain.handle('connection:getUserList', () => {
  return hotlineSession.getUserList();
})

ipcMain.handle('connection:sendPublicMessage', (args, text: string) => {
  return hotlineSession.sendPublicMessage(text);
})

hotlineSession.setEventListener({
  privateMessage: function (from: number, message: string): void {
    console.log('Sending private message to frontend ' + JSON.stringify(message))
    win.webContents.send('connection:privateMessage', { 'from': from, 'text': message })
  },
  publicMessage: function (message: MessageUpdate): void {
    console.log('Sending inbound public message to frontend ' + JSON.stringify(message))
    win.webContents.send('connection:publicMessage', message)
  },
  notifyDeleteUser: function (userID: number): void {
    win.webContents.send('connection:notifyDeleteUser', userID)
  },
  notifyChangeUser(userID: number, userName: string): void {
    win.webContents.send('connection:notifyChangeUser', { 'userID': userID, 'userName': userName })
  },
  reportError(error: string): void {
    win.webContents.send('connection:error', error)
  },
  userList: function (userListUpdate: UserListUpdate): void {
    win.webContents.send('connection:userList', userListUpdate)
  }
} as ServerToClientEventListener);

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key);
});

ipcMain.handle('setStoreValue', (event, keyValuePair: KeyValuePair) => {
  console.log(`Keyvalue pair : ${JSON.stringify(keyValuePair)}`);
  console.log(`setting store value ${keyValuePair.key} as ${keyValuePair.value}`)
  return store.set(keyValuePair.key, keyValuePair.value);
});
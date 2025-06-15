import path from 'path'
import { app, BrowserWindow, ipcMain, nativeTheme, session } from 'electron'
import { is } from 'electron-util'
import { isDev } from 'electron-util/main'
import * as url from 'node:url'
import HotlineSession from './hotlineSession.js'

import Store from 'electron-store'
import { KeyValuePair } from '../shared/KeyValuePair.js'
import ServerToClientEventListener from '../shared/types/ServerToClientEvents.js'
import { MessageUpdate, UserListUpdate } from '../shared/types/APITypes.js'

// Avoid GTK 4 issue
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('gtk-version', '3');
}

const store = new Store();


let win: BrowserWindow | null = null

const dirname = path.dirname(new URL(import.meta.url).pathname)

let hotlineSession: HotlineSession = new HotlineSession(store);

async function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 820,
    minHeight: 600,
    minWidth: 650,
    webPreferences: {
      preload: path.join(dirname, 'preload.mjs'),
      nodeIntegration: true,
    },
    show: false,
    icon: path.join(dirname, '/assets/icon.icns')
  });


  if (isDev) {
      // this is the default port electron-esbuild is using
      win.loadURL('http://localhost:9080')
    } else {
      win.loadURL(
        url.format({
          pathname: path.join(dirname, 'index.html'),
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


app.whenReady().then(createWindow)

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
    win?.webContents.send('connection:privateMessage', { 'from': from, 'text': message })
  },
  publicMessage: function (message: MessageUpdate): void {
    console.log('Sending inbound public message to frontend ' + JSON.stringify(message))
    win?.webContents.send('connection:publicMessage', message)
  },
  notifyDeleteUser: function (userID: number): void {
    win?.webContents.send('connection:notifyDeleteUser', userID)
  },
  notifyChangeUser(userID: number, userName: string): void {
    win?.webContents.send('connection:notifyChangeUser', { 'userID': userID, 'userName': userName })
  },
  reportError(error: string): void {
    win?.webContents.send('connection:error', error)
  },
  userList: function (userListUpdate: UserListUpdate): void {
    win?.webContents.send('connection:userList', userListUpdate)
  }
} as ServerToClientEventListener);

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key);
});

ipcMain.handle('setStoreValue', (event, keyValuePair: KeyValuePair) => {
  console.log(`Keyvalue pair : ${JSON.stringify(keyValuePair)}`);

  const { key, value } = keyValuePair
  if (!value) {
    store.delete(key)
    return
  }
  
  console.log(`setting store value ${key} as ${value}`)
  return store.set(key, value);
});
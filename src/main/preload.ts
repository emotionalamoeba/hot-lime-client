
// All of the Node.js APIs are available in the preload process.

import { KeyValuePair } from "src/shared/KeyValuePair";
import HotlineAPI from "src/shared/types/hotlineAPI";

// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload was called');

contextBridge.exposeInMainWorld('hotlineAPI', {
    connect: () => ipcRenderer.invoke('connection:connect'),

    login: (username: string) => ipcRenderer.invoke('connection:login', username),

    getUserList: () => ipcRenderer.invoke('connection:getUserList'),

    sendPublicMessage: (text: string) => ipcRenderer.invoke('connection:sendPublicMessage', text),

    receive: (channel, func) => {
        // console.log('preload: got a server event ' + channel);
        //. let validChannels = ["fromMain"];
        // if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        // ipcRenderer.on(channel, (event, ...args) => func(...args));
        // }
        ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
    ,
    getStoreValue: (key: string) => {
        return ipcRenderer.invoke('getStoreValue', key);
    },
    setStoreValue: (keyValuePair: KeyValuePair) => {
        ipcRenderer.invoke('setStoreValue', keyValuePair);
    }
} as HotlineAPI)

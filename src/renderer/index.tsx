import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import './index.css'

import { store } from '../shared/store.js';
import { Provider } from 'react-redux';
import { Loader } from './Loader.js';
import { Listener } from './Listener.js';
import HotlineAPI from '../shared/types/hotlineAPI.js';

declare global {
    interface Window {
        hotlineAPI: HotlineAPI;
    }
}

const container = document.getElementById('root')
if (container) {
    const root = createRoot(container)
root.render(<Provider store={store}><App /><Loader /><Listener /></Provider>, )
}
import React from 'react'
import { render } from 'react-dom'
import { App } from './App'
import './index.css'

import { store } from '../shared/store';
import { Provider } from 'react-redux';
import { Loader } from './Loader';
import { Listener } from './Listener';
import HotlineAPI from 'src/shared/types/hotlineAPI';

declare global {
    interface Window {
        hotlineAPI: HotlineAPI;
    }
}

render(<Provider store={store}><App /><Loader /><Listener /></Provider>, document.getElementById('root'))

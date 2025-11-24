import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { Provider } from 'react-redux';
import { store } from './src/store';
import 'tippy.js/dist/tippy.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
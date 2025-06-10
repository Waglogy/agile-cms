import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { NotificationProvider } from './context/NotificationContext'

// 1. Import Redux bits
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './store/index' 

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
)

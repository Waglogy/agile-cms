import React, { createContext, useContext, useState } from 'react'

const NotificationContext = createContext()

export const useNotification = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }) => {
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')

  const showAppMessage = (msg, msgType = 'info') => {
    setMessage(msg)
    setType(msgType)
    setTimeout(() => setMessage(''), 5000)
  }

  return (
    <NotificationContext.Provider value={{ showAppMessage }}>
      {children}

      {message && (
        <div
          className={`fixed bottom-0 left-0 bg-[#fefce8]  right-0 text-red  text-xl p-3 text-center shadow-md z-50 ${
            type === 'error'
              ? 'bg-red-600'
              : type === 'success'
              ? 'bg-green-600'
              : 'bg-[#fefce8]'
          }`}
        >
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  )
}

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: '',
      appMessage: '',
      messageType: 'info',
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error.toString(),
      messageType: 'error',
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  showMessage = (message, type = 'info') => {
    this.setState({ appMessage: message, messageType: type })

    setTimeout(() => {
      this.setState({ appMessage: '', messageType: 'info' })
    }, 5000)
  }

  render() {
    const { appMessage, messageType } = this.state
    const { children } = this.props

    const messageStyle = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
    }[messageType]

    // ✅ This is the key: inject showAppMessage
    const enhancedChildren = React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, { showAppMessage: this.showMessage })
        : child
    )

    return (
      <>
        {enhancedChildren}

        {appMessage && (
          <div
            className={`fixed bottom-0 left-0 right-0 ${messageStyle} text-white text-sm p-3 text-center shadow-md z-50`}
          >
            {appMessage}
          </div>
        )}
      </>
    )
  }
}

export default ErrorBoundary

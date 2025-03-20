import React from 'react'

const PopUp = ({ show, children, modalContent, onClose }) => {
  if (!show) return null // Prevent rendering when `show` is false

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 relative border border-gray-300">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ✖
        </button>

        {/* Header */}
        <div className="text-center pb-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {modalContent}
          </h2>
        </div>

        {/* Content */}
        <section className="py-4">{children}</section>
      </div>
    </div>
  )
}

export default PopUp

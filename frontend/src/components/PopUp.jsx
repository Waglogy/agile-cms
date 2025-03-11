import React from 'react';

const PopUp = ({ show, children, modalContent }) => {
  if (!show) return null; // Prevents rendering when `show` is false

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="lg:w-full h-full bg-white  shadow-lg p-6 relative">
        {/* Header */}
        <div className="p-4">
          <h2 className="text-lg font-bold">{modalContent}</h2>
        </div>
        <hr />
        {/* Content */}
        <section className="p-5 flex justify-center items-center">
          {children}
        </section>
      </div>
    </div>
  );
};

export default PopUp;

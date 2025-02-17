import React from 'react';

const PopUp = ({ show, children, modalContent}) => {
  return (
    <div className="w-full h-full z-300 bg-[#ffffff33] bg-opacity-50 fixed">
        
        <div className={show ? "modal display-block" : "modal display-none"}>
            <div className=" lg:w-[60%] h-[60%] bg-black absolute bottom-50 right-50 p-3 ">
                <div className="p-4 ">
                    <h2 className="text-lg font-bold">{modalContent}</h2>

                </div>
                <hr />
                <section className="modal-main p-5 flex justify-center items-center">
                    {children}
                </section>
                

        </div>
        </div>
    </div>
  );
};

export default PopUp;
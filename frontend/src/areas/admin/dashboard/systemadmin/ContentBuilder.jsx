import React, { useState } from "react";
import {useForm} from "react-hook-form"
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import MenuBar from "../../../../components/MenuBar";
import PopUp from "../../../../components/PopUp";

const ContentBuilder = () => {
    const [modalContent, setModalContent] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const {register, handleSubmit} = useForm();
    const onSubmit = (data) => {
        console.log(data)
    }
    return (
        <>
            <Header />
            <div className="flex">
            <MenuBar />
            <Sidebar isModalOpen={isModalOpen} setModalOpen={setModalOpen} setModalContent ={setModalContent} />

            {/* Popup when create new collection is clicked */}
            {isModalOpen && (<PopUp show={isModalOpen} modalContent={modalContent}>
                
                <form className="mt-4 flex flex-col " onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="collecion_name" className="text-xs font-bold" >Collection Name</label>
                    <input type="text" placeholder="Enter Collection Name" className="w-50 h-15 rounded bg-gray-900 border-gray-700 rounded-md text-center mt-3" id="collecion_name"
                    {...register("Collection Name", { required: true })}
                    />
                    <div className="flex justify-between items-flex-end">
                        <button className="bg-blue-600 text-white rounded px-4 py-2 mt-4 rounded" onClick={()=>{setModalOpen(false)}}>Close</button>
                        <button type="Submit" className="bg-green-700 text-center px-4 py-2 mt-4 rounded" >Save</button>
                    </div>
                    
                </form>
            </PopUp>)

            }
            
            </div>
        </>
    );
};

export default ContentBuilder;
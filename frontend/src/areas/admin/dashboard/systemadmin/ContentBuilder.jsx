import React, { useState } from "react";
import {useForm} from "react-hook-form"
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import MenuBar from "../../../../components/MenuBar";
import PopUp from "../../../../components/PopUp";
import Input from "../../../../reusable-components/inputs/InputTextBox/Input";
import Error from "../../../../reusable-components/outputs/Error";

const ContentBuilder = () => {
    const [modalContent, setModalContent] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const {register, handleSubmit, formState:{errors}, setError, clearErrors, setValue} = useForm();
    // const onSubmit = async (data) => {
    //     const postData = {
    //         "table_name": data.table_name.toLowerCase().replace(/\s+/g, '_'),
    //         "schema":{
                
    //         }            
    // }
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
                    <Input 
                        defaultName="Display Name"
                        register={register}
                        name="tableName"
                        required={true}
                        pattern={null}
                        errors={errors}
                        placeholder="Display Name"
                        setError={setError}
                        clearError={clearErrors}
                        autoComplete="off"
                        type="text"
                        classes={`rounded-md px-3 py-2 text-sm w-full text-white`}
                        onChangeInput={null}
                        setValue={setValue}
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
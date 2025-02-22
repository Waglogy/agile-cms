import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import MenuBar from "../../../../components/MenuBar";
import PopUp from "../../../../components/PopUp";
import Input from "../../../../reusable-components/inputs/InputTextBox/Input";
import Error from "../../../../reusable-components/outputs/Error";
import createNewComponent from "../../../../api/super_admin/createNewComponent";
import GetData from "../../../../api/super_admin/GetData";
import EditButton from "../../../../reusable-components/buttons/EditButton";
import EditArchitecture from "../../../../api/super_admin/EditArchitecture"
import DeleteComponent from "../../../../api/super_admin/DeleteComponent"
import { FiDelete } from "react-icons/fi";
const ContentBuilder = () => {
    const [modalContent, setModalContent] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, setError, clearErrors, setValue } = useForm();

    const [display, setDisplayName] = useState('');
    const [fields, setFields] = useState([{ name: '', type: 'TEXT' }]); // Default type is TEXT
    const fieldTypes = ['TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'NUMERIC', 'JSONB'];
    const [apiData, setApiData] = useState([]);
    const [collection, setCollection] = useState([]);
    const [isAddColumnOpen, setAddColumnOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            const result = await GetData();
            setApiData(result);
            if (result.length > 0) {
                setCollection({
                    name: result[0].collection_name,
                    columns: result[0].columns || []
                });
            }
        };
        fetchData();
    }, []);

    const addField = () => {
        setFields([...fields, { name: '', type: 'TEXT' }]); // Default type is TEXT
    };

    const removeField = (index) => {
        if (fields.length > 1) {
            const updatedFields = fields.filter((_, i) => i !== index);
            setFields(updatedFields);
        }
    };

    const handleFieldNameChange = (index, value) => {
        const updatedFields = [...fields];
        updatedFields[index].name = value;
        setFields(updatedFields);
    };

    const handleFieldTypeChange = (index, value) => {
        const updatedFields = [...fields];
        updatedFields[index].type = value;
        setFields(updatedFields);
    };


    const handleCollectionSelection = (collectionName, columns) => {
        const newCollection = {
            name: collectionName,
            columns: columns || []
        };
        setCollection(newCollection);

    };

    const handleAddColumn = async (data) => {
        try {
            const postData = {
                tableName: collection.name,
                columnName: data.columnName,
                columnType: data.columnType.toUpperCase(),
                constraints: "DEFAULT 0"
            };


            await EditArchitecture(postData);
            setAddColumnOpen(false);
            window.location.reload();
        } catch (error) {
            console.error("Error adding column:", error);
        }
    };
    const onSubmit = async (data) => {
        try {
            const schema = {};
            fields.forEach((field) => {
                if (field.name && field.type) {
                    schema[field.name] = {
                        type: field.type,
                        constraints: "NOT NULL"
                    };
                }
            });

            const postData = {
                tableName: data.Display_name.toLowerCase().replace(/\s+/g, '_'),
                schema: schema
            };


            await createNewComponent(postData);
            window.location.reload();
        } catch (error) {
            console.error("Error creating component: ", error);
        }
    };

    const handleDeleteComponent = async (data) => {
        try {
            const collectionName = data
            const postData = {
                collectionName
            }
            DeleteComponent(postData)
            window.location.reload()
        } catch (error) {
            console.error(error)
        }
    };

    return (
        <div>
            <Header />
            <div className="flex">
                <MenuBar />
                <Sidebar
                    setModalOpen={setModalOpen}
                    setModalContent={setModalContent}
                    setCollection={handleCollectionSelection} // Pass the handler function
                />

                {/* Popup to create components */}
                {isModalOpen && (
                    <PopUp show={isModalOpen} modalContent={modalContent}>
                        <form className="mt-4 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
                            <label htmlFor="collection_name" className="text-xs font-bold">Collection Name</label>
                            <Input
                                defaultName="Display_name"
                                register={register}
                                name="Display Name"
                                required={true}
                                pattern={null}
                                errors={errors}
                                placeholder="Display Name"
                                setError={setError}
                                clearError={clearErrors}
                                autoComplete="off"
                                type="text"
                                classes="rounded-md px-3 py-2 text-sm w-full text-white"
                                onChangeInput={(value) => setDisplayName(value)}
                                setValue={setValue}
                            />
                            <Error error={errors["Display Name"]} />

                            {fields.map((field, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="flex gap-2 items-end">
                                        <div className="flex-1">
                                            <Input
                                                defaultName={`field_name_${index}`}
                                                register={register}
                                                name={`Field Name ${index + 1}`}
                                                required={true}
                                                pattern={null}
                                                errors={errors}
                                                placeholder="Field Name"
                                                setError={setError}
                                                clearError={clearErrors}
                                                autoComplete="off"
                                                type="text"
                                                classes="rounded-md px-3 py-2 text-sm w-full text-white"
                                                onChangeInput={(value) => handleFieldNameChange(index, value)}
                                                setValue={setValue}
                                            />
                                            <Error error={errors[`field_name_${index}`]} />
                                        </div>
                                        <div className="flex-1">
                                            <label htmlFor={`field_type_${index}`} className="flex items-center font-medium text-left text-gray-500 pl-1 pb-2 text-xs md:text-sm lg:text-base">Field Type</label>
                                            <select
                                                id={`field_type_${index}`}
                                                className="rounded-md px-3 py-2 text-sm w-full text-white bg-gray-700 border border-gray-600 focus:outline-none focus:ring-0 focus:border-secondary"
                                                value={field.type}
                                                onChange={(e) => handleFieldTypeChange(index, e.target.value)}
                                            >
                                                <option value="" disabled>Select Field Type</option>
                                                {fieldTypes.map((type, i) => (
                                                    <option key={i} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-red-600 text-white rounded px-3 py-2 h-[42px] ml-2 hover:bg-red-700"
                                            onClick={() => removeField(index)}
                                            disabled={fields.length === 1}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white rounded px-4 py-2"
                                    onClick={addField}
                                >
                                    Add Field
                                </button>
                            </div>

                            <div className="flex justify-between items-end mt-4">
                                <button
                                    type="button"
                                    className="bg-blue-600 text-white rounded px-4 py-2"
                                    onClick={() => setModalOpen(false)}
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="bg-green-700 text-white rounded px-4 py-2"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </PopUp>
                )}

                {
                    collection.name ?
                        (<div className="body w-full h-full">
                            <div className="collection_header p-5">
                                <div className="flex items-center gap-10">
                                    <h1 className="font-bold capitalize text-xl">{collection.name}</h1>
                                    <FiDelete onClick={() => { handleDeleteComponent(collection.name) }} />
                                </div>
                                <p className="capitalize text-l text-gray-500">Data architecture of your content</p>
                            </div>
                            <div className="collection_body">
                                <div className="w-full h-full flex justify-center items-center flex-col">
                                    <table className="w-90 h-full text-center border-collapse border border-gray-400">
                                        <thead>
                                            <tr className="border border-gray-300">
                                                <th>Name</th>
                                                <th>Type</th>

                                            </tr>
                                        </thead>
                                        <tbody>
                                            {collection.columns?.map((col, index) => (
                                                <tr key={index} className="border border-gray-300 ">
                                                    <td >{col.column_name}</td>
                                                    <td className="capitalize">{col.data_type}</td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <div className="pt-5">
                                        <button
                                            type="button"
                                            className="bg-green-500 text-white px-4 py-2 rounded"
                                            onClick={() => setAddColumnOpen(true)}
                                        >
                                            Add Column
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>)
                    :
                    (
                        <div className="font-bold text-xl m-auto">
                            <h1 className="text-center">Add a Collection to view <br />or <br />Start your backend </h1>
                        </div>
                    )
                }

                {isAddColumnOpen && (
                    <PopUp modalContent="Add New Column">
                        <form onSubmit={handleSubmit(handleAddColumn)}>
                            <div className="flex flex-col gap-4">
                                <Input
                                    defaultName="columnName"
                                    register={register}
                                    name="columnName"
                                    required={true}
                                    pattern={null}
                                    errors={errors}
                                    placeholder="Column Name"
                                    setError={setError}
                                    clearError={clearErrors}
                                    autoComplete="off"
                                    type="text"
                                    classes="rounded-md px-3 py-2 text-sm w-full text-white"
                                    setValue={setValue}
                                />

                                <div className="flex flex-col w-full">
                                    <label className="text-xs font-bold mb-2">Column Type</label>
                                    <select
                                        {...register("columnType")}
                                        className="rounded-md px-3 py-2 text-sm w-full text-white bg-gray-700 border border-gray-600"
                                        defaultValue="TEXT"
                                    >
                                        {fieldTypes.map((type, i) => (
                                            <option key={i} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-4 justify-end">
                                    <button
                                        type="button"
                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                        onClick={() => setAddColumnOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        Add Column
                                    </button>
                                </div>
                            </div>
                        </form>
                    </PopUp>
                )}
            </div >
        </div>
    );
};

export default ContentBuilder;
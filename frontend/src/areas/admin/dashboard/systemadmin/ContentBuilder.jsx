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
    <div className="flex bg-white">
        <MenuBar />
        <Sidebar
            setModalOpen={setModalOpen}
            setModalContent={setModalContent}
            setCollection={handleCollectionSelection} // Pass the handler function
        />

        {/* Popup to create components */}
        {isModalOpen && (
    <PopUp show={isModalOpen} modalContent={modalContent}>
        <form className="mt-6 space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <label htmlFor="collection_name" className="text-sm font-semibold text-white">Collection Name</label>
                <Input
                    defaultName="Display_name"
                    register={register}
                    name="Display Name"
                    required={true}
                    pattern={null}
                    errors={errors}
                    placeholder="Enter Collection Name"
                    setError={setError}
                    clearError={clearErrors}
                    autoComplete="off"
                    type="text"
                    classes="rounded-lg px-4 py-3 text-sm w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChangeInput={(value) => setDisplayName(value)}
                    setValue={setValue}
                />
                <Error error={errors["Display Name"]} />
            </div>

            {fields.map((field, index) => (
                <div key={index} className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <Input
                                defaultName={`field_name_${index}`}
                                register={register}
                                name={`Field Name ${index + 1}`}
                                required={true}
                                pattern={null}
                                errors={errors}
                                placeholder="Enter Field Name"
                                setError={setError}
                                clearError={clearErrors}
                                autoComplete="off"
                                type="text"
                                classes="rounded-lg px-4 py-3 text-sm w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChangeInput={(value) => handleFieldNameChange(index, value)}
                                setValue={setValue}
                            />
                            <Error error={errors[`field_name_${index}`]} />
                        </div>

                        <div className="flex-1">
                            <label htmlFor={`field_type_${index}`} className="text-sm font-semibold text-white">Field Type</label>
                            <select
                                id={`field_type_${index}`}
                                className="rounded-lg px-4 py-3 text-sm w-full bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="bg-red-600 text-white rounded-lg px-4 py-2 h-[42px] hover:bg-red-700 focus:outline-none"
                            onClick={() => removeField(index)}
                            disabled={fields.length === 1}
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}

            <div className="flex justify-start gap-4 mt-4">
                <button
                    type="button"
                    className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none"
                    onClick={addField}
                >
                    Add Field
                </button>
            </div>

            <div className="flex justify-between items-center mt-6">
                <button
                    type="button"
                    className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:bg-gray-600 focus:outline-none"
                    onClick={() => setModalOpen(false)}
                >
                    Close
                </button>
                <button
                    type="submit"
                    className="bg-green-700 text-white rounded-lg px-6 py-3 hover:bg-green-800 focus:outline-none"
                >
                    Save
                </button>
            </div>
        </form>
    </PopUp>
)}


        {collection.name ? (
            <div className="w-full h-full bg-gray-800 p-2 m-5 rounded-lg shadow-lg mt-37">
                <div className="collection_header mb-6 p-6">
                    <div className="flex items-center gap-8">
                        <h1 className="font-bold text-2xl text-white capitalize">{collection.name}</h1>
                        <FiDelete
                            onClick={() => { handleDeleteComponent(collection.name) }}
                            className="text-red-600 hover:text-red-700 cursor-pointer"
                        />
                    </div>
                    <p className="text-lg text-gray-400 capitalize">Data architecture of your content</p>
                </div>
                <div className="collection_body p-6">
                    <div className="w-full h-full flex justify-center items-center flex-col">
                        <table className="w-full table-auto border-collapse border border-gray-600 text-white">
                            <thead>
                                <tr className="bg-gray-700">
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collection.columns?.map((col, index) => (
                                    <tr key={index} className="border border-gray-600">
                                        <td className="px-4 py-2">{col.column_name}</td>
                                        <td className="px-4 py-2 capitalize">{col.data_type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pt-5">
                            <button
                                type="button"
                                className="bg-blue-600 text-white px-8 py-2 rounded-lg  hover:bg-zinc-700"
                                onClick={() => setAddColumnOpen(true)}
                            >
                                Add Column
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="font-bold text-xl text-center text-blue-400 mt-20">
                <h1>Add a Collection to view <br />or <br />Start your backend</h1>
            </div>
        )}

        {isAddColumnOpen && (
            <PopUp modalContent="Add New Column">
                <form onSubmit={handleSubmit(handleAddColumn)} className="space-y-4">
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
                        classes="rounded-md px-4 py-3 text-sm w-full bg-gray-700 text-white"
                        setValue={setValue}
                    />

                    <div className="flex flex-col">
                        <label className="text-xs font-semibold mb-2">Column Type</label>
                        <select
                            {...register("columnType")}
                            className="rounded-md px-4 py-3 text-sm w-full bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            onClick={() => setAddColumnOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Add Column
                        </button>
                    </div>
                </form>
            </PopUp>
        )}
    </div>
</div>

    );
};

export default ContentBuilder;
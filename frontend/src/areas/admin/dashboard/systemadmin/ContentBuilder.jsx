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
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="flex">
                <MenuBar />
                <Sidebar
                    setModalOpen={setModalOpen}
                    setModalContent={setModalContent}
                    setCollection={handleCollectionSelection}
                />

                {/* Main Content Area */}
                <main className="flex-1 p-8">
                    {collection.name ? (
                        <div className="bg-white rounded-lg shadow-xl overflow-hidden mt-20">
                            {/* Collection Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white capitalize">
                                            {collection.name}
                                        </h1>
                                        <p className="text-blue-100 mt-2">
                                            Data architecture of your content
                                        </p>
                                    </div>
                                    <FiDelete
                                        onClick={() => handleDeleteComponent(collection.name)}
                                        className="text-white hover:text-red-200 cursor-pointer text-2xl transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Collection Body */}
                            <div className="p-8">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {collection.columns?.map((col, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {col.column_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                        {col.data_type}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                        onClick={() => setAddColumnOpen(true)}
                                    >
                                        Add Column
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                Add a Collection to view
                            </h1>
                            <p className="text-gray-600 text-lg">
                                or Start your backend
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* Popup Modals */}
            {isModalOpen && (
                <PopUp show={isModalOpen} modalContent={modalContent}>
                    <form
                        className="mt-6 space-y-6 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-3">
                            <label
                                htmlFor="collection_name"
                                className="text-sm font-semibold text-gray-200 tracking-wide"
                            >
                                Collection Name
                            </label>
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
                                classes="rounded-lg px-4 py-3 text-sm w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:bg-gray-600"
                                onChangeInput={(value) => setDisplayName(value)}
                                setValue={setValue}
                            />
                            <Error error={errors['Display Name']} />
                        </div>

                        {fields.map((field, index) => (
                            <div key={index} className="space-y-4 animate-fadeIn">
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
                                            classes="rounded-lg px-4 py-3 text-sm w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:bg-gray-600"
                                            onChangeInput={(value) =>
                                                handleFieldNameChange(index, value)
                                            }
                                            setValue={setValue}
                                        />
                                        <Error error={errors[`field_name_${index}`]} />
                                    </div>

                                    <div className="flex-1">
                                        <label
                                            htmlFor={`field_type_${index}`}
                                            className="text-sm font-semibold text-gray-200 tracking-wide"
                                        >
                                            Field Type
                                        </label>
                                        <select
                                            id={`field_type_${index}`}
                                            className="rounded-lg px-4 py-3 text-sm w-full bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out hover:bg-gray-600"
                                            value={field.type}
                                            onChange={(e) =>
                                                handleFieldTypeChange(index, e.target.value)
                                            }
                                        >
                                            <option value="" disabled>
                                                Select Field Type
                                            </option>
                                            {fieldTypes.map((type, i) => (
                                                <option key={i} value={type}>
                                                    {type}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="button"
                                        className="bg-red-600 text-white rounded-lg px-4 py-2 h-[42px] hover:bg-red-700 focus:outline-none transition-colors duration-300 ease-in-out transform hover:scale-105"
                                        onClick={() => removeField(index)}
                                        disabled={fields.length === 1}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-start gap-4 mt-6">
                            <button
                                type="button"
                                className="bg-blue-600 text-white rounded-lg px-6 py-2 hover:bg-blue-700 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-blue-500/50"
                                onClick={addField}
                            >
                                Add Field
                            </button>
                        </div>

                        <div className="flex justify-between items-center mt-8">
                            <button
                                type="button"
                                className="bg-gray-600 text-white rounded-lg px-6 py-2 hover:bg-gray-700 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                                onClick={() => setModalOpen(false)}
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                className="bg-green-600 text-white rounded-lg px-8 py-3 hover:bg-green-700 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                </PopUp>
            )}

            {isAddColumnOpen && (
                <PopUp
                    show={isAddColumnOpen}
                    modalContent="Add New Column"
                    onClose={() => setAddColumnOpen(false)}
                >
                    <form
                        onSubmit={handleSubmit(handleAddColumn)}
                        className="space-y-4"
                    >
                        {/* Column Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-black">
                                Column Name
                            </label>
                            <input
                                {...register('columnName')}
                                required
                                placeholder="Enter column name"
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        {/* Column Type Select */}
                        <div>
                            <label className="block text-sm font-medium text-black">
                                Column Type
                            </label>
                            <select
                                {...register('columnType')}
                                className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-black"
                                defaultValue="TEXT"
                            >
                                {fieldTypes.map((type, i) => (
                                    <option key={i} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                                onClick={() => setAddColumnOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Add Column
                            </button>
                        </div>
                    </form>
                </PopUp>
            )}
        </div>
    );
};

export default ContentBuilder;
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import Input from "../../reusable-components/inputs/InputTextBox/Input";
import PasswordInput from "../../reusable-components/inputs/InputTextBox/PasswordInput";
import bbLogo from "../../assets/bbLogo.png"
import Header from "../../components/Header";
const LoginForm = () => {
    const navigate = useNavigate();

    const [isLoggingInText, setIsLoggingInText] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
        setValue
    } = useForm({
        mode: "onChange",
        criteriaMode: "all",
    });
    
    const onSubmitLogin = async (data) => {
        try{
            setIsLoggingInText(true);
            await new Promise((resolve) =>
                setTimeout(resolve, 3000)
            );
            navigate("/admin");
        }
        catch(error){
            console.error("An error occurred:", error);
        }
        finally{
            setIsLoggingInText(false);
        }
    };

    return(
        <>
            <Header />
            <section className="w-full h-[100vh] m-auto flex bg-gray-100">
                
                <div className="flex justify-center items-center flex-col w-full">

                    
                    

                    {/* form */}
                    <section className="w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[25%] h-[40%] p-5 rounded-md shadow-lg bg-white ">
                        <p className="text-center text-primary text-base md:text-lg lg:text-xl font-semibold mb-3"> Admin Login</p>

                        <form onSubmit={handleSubmit(onSubmitLogin)}>
                            <Input 
                                defaultName="email"
                                register={register}
                                name="Email"
                                required={true}
                                pattern={null}
                                errors={errors}
                                placeholder="Enter username"
                                setError={setError}
                                clearError={clearErrors}
                                autoComplete="off"
                                type="text"
                                classes={`rounded-md px-3 py-2 text-sm w-full`}
                                onChangeInput={null}
                                // defaultValue={defaultValues.user_email}
                                setValue={setValue}
                            />

                            
                            <PasswordInput
                                id="myPasswordInput"
                                type={"password"}
                                defaultName="user_password"
                                register={register}
                                name="Password"
                                required={true}
                                pattern={null}
                                errors={errors}
                                placeholder="Enter password"
                                setError={setError}
                                clearError={clearErrors}
                                autoComplete="off"
                                classes={`rounded-md px-3 py-2 text-sm w-full bg-white`}
                                onChangeInput={null}
                                setValue={setValue}
                            />

                            <button onClick={() => handleSubmit()}
                            className="bg-black text-white rounded-md px-3 py-2 mt-5 text-sm w-full uppercase">
                                {!isLoggingInText ? (
                                <div className="flex gap-x-1 justify-center items-center">
                                    Login
                                </div>
                                ) : (
                                <div className="flex gap-x-1 justify-center items-center">
                                    <p>Logging in</p>
                                </div>
                                )}
                            </button>

                        </form>
                    </section>

                </div>


            </section>
        
        </>
    )
};
export default LoginForm;
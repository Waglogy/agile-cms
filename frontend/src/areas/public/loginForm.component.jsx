import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import Input from '../../reusable-components/inputs/InputTextBox/Input'
import PasswordInput from '../../reusable-components/inputs/InputTextBox/PasswordInput'
import bbLogo from '../../assets/bbLogo.png'
import Header from '../../components/Header'
import bcryptjs from 'bcryptjs'
import CreateUser from '../../api/super_admin/CreateUser'
const handleLogin = async (data) => {
  try {
    const tableName = 'users'
    const passwordHash = await hashPassword(data.password)
    const postData = {
      tableName,
      data: {
        email: data.email,
        password_hash: passwordHash,
        created_at: localDate,
      },
    }
    CreateUser(postData)
    console.log(postData)
  } catch (error) {
    console.error(error)
  }
}
const hashPassword = async (password) => {
  const saltRounds = 10 // Number of salt rounds (higher = more secure but slower)
  const hashedPassword = await bcryptjs.hash(password, saltRounds)
  return hashedPassword
}

const LoginForm = () => {
  const navigate = useNavigate()

  const [isLoggingInText, setIsLoggingInText] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    setValue,
  } = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
  })

  const onSubmitLogin = async (data) => {
    try {
      setIsLoggingInText(true)
      await new Promise((resolve) => setTimeout(resolve, 3000))
      navigate('/admin')
    } catch (error) {
      console.error('An error occurred:', error)
    } finally {
      setIsLoggingInText(false)
    }
  }

  return (
    <>
      <Header />
      <section className="w-full h-[100vh] m-auto flex bg-gray-100">
        <div className="flex justify-center items-center flex-col w-full">
          {/* form */}
          <section className="w-[80%] md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[25%] h-[40%] p-4 rounded-lg shadow-lg bg-white  ">
            <p className="text-center text-primary text-base md:text-lg lg:text-xl font-semibold mb-3">
              {' '}
              Admin Login
            </p>

            <form onSubmit={handleSubmit(handleLogin)}>
              <Input
                defaultName="email"
                register={register}
                name="Email"
                required={true}
                pattern={null}
                errors={errors}
                placeholder="Email"
                setError={setError}
                clearError={clearErrors}
                autoComplete="off"
                type="text"
                classes={`rounded-md px-3 py-2 text-sm w-full text-black`}
                onChangeInput={null}
                // defaultValue={defaultValues.user_email}
                setValue={setValue}
              />

              <PasswordInput
                id="myPasswordInput"
                type={'password'}
                defaultName="password"
                register={register}
                name="Password"
                required={true}
                pattern={null}
                errors={errors}
                placeholder="Enter password"
                setError={setError}
                clearError={clearErrors}
                autoComplete="off"
                classes={`rounded-md px-3 py-2 text-sm w-full bg-white text-black`}
                onChangeInput={null}
                setValue={setValue}
              />

              <button
                onClick={() => handleSubmit()}
                className="bg-black text-white rounded-md px-3 py-2 mt-5 text-sm w-full uppercase  "
              >
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
}
export default LoginForm

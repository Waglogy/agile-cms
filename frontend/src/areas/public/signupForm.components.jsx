// import React, { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { useNavigate } from 'react-router-dom'

// import Input from '../../reusable-components/inputs/InputTextBox/Input'
// import PasswordInput from '../../reusable-components/inputs/InputTextBox/PasswordInput'
// import bbLogo from '../../assets/bbLogo.png'
// import Header from '../../components/Header'
// import CreateUser from '../../api/super_admin/CreateUser'
// import Error from '../../reusable-components/outputs/Error'
// const handleSignup = async (data) => {
//   try {
//     if (data.password != data.confirmpassword) {
//       document.getElementById('errors').innerHTML = 'password doesnot match'
//       document.getElementById('errors').style = 'color:red'
//       throw new Error('password doesnot match')
//     }
//     const postData = {
//       first_name: data.FirstName,
//       last_name: data.LastName,
//       email: data.email,
//       password: data.password,
//     }
//     await CreateUser(postData)
//     console.log(postData)
//   } catch (error) {
//     console.error(error)
//   }
// }
// const hashPassword = async (password) => {
//   const saltRounds = 10 // Number of salt rounds (higher = more secure but slower)
//   const hashedPassword = await bcryptjs.hash(password, saltRounds)
//   return hashedPassword
// }

// const SignupForm = () => {
//   const navigate = useNavigate()

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setError,
//     clearErrors,
//     setValue,
//   } = useForm({
//     mode: 'onChange',
//     criteriaMode: 'all',
//   })

//   return (
//     <>
//       <Header />
//       <section className="w-full h-[100vh] m-auto flex bg-gray-100 mt-10">
//         <div className="flex justify-center items-center flex-col w-full">
//           {/* form */}
//           <section className=" md:w-[50%] lg:w-[40%] xl:w-[30%] 2xl:w-[25%] p-5 rounded-lg shadow-lg bg-white ">
//             <p className="text-center text-black text-bold md:text-lg lg:text-xl font-bold mb-3 ">
//               {' '}
//               SIGN UP{' '}
//             </p>

//             <form onSubmit={handleSubmit(handleSignup)}>
//               <Input
//                 defaultName="FirstName"
//                 register={register}
//                 name="First Name"
//                 required={true}
//                 pattern={null}
//                 errors={errors}
//                 placeholder="John"
//                 setError={setError}
//                 clearError={clearErrors}
//                 autoComplete="off"
//                 type="text"
//                 classes={`rounded-md px-3 py-2 text-sm w-full text-black`}
//                 onChangeInput={null}
//                 // defaultValue={defaultValues.user_email}
//                 setValue={setValue}
//               />
//               <Input
//                 defaultName="LastName"
//                 register={register}
//                 name="Last Name"
//                 required={true}
//                 pattern={null}
//                 errors={errors}
//                 placeholder="Doe"
//                 setError={setError}
//                 clearError={clearErrors}
//                 autoComplete="off"
//                 type="text"
//                 classes={`rounded-md px-3 py-2 text-sm w-full text-black`}
//                 onChangeInput={null}
//                 // defaultValue={defaultValues.user_email}
//                 setValue={setValue}
//               />
//               <Input
//                 defaultName="email"
//                 register={register}
//                 name="Email"
//                 required={true}
//                 pattern={null}
//                 errors={errors}
//                 placeholder="johndoe@gmail.com"
//                 setError={setError}
//                 clearError={clearErrors}
//                 autoComplete="off"
//                 type="text"
//                 classes={`rounded-md px-3 py-2 text-sm w-full text-black`}
//                 onChangeInput={null}
//                 // defaultValue={defaultValues.user_email}
//                 setValue={setValue}
//               />

//               <PasswordInput
//                 id="myPasswordInput"
//                 type={'password'}
//                 defaultName="password"
//                 register={register}
//                 name="Password"
//                 required={true}
//                 pattern={null}
//                 errors={errors}
//                 placeholder="********"
//                 setError={setError}
//                 clearError={clearErrors}
//                 autoComplete="off"
//                 classes={`rounded-md px-3 py-2 text-sm w-full bg-white text-black`}
//                 onChangeInput={null}
//                 setValue={setValue}
//               />
//               <PasswordInput
//                 id="myConfirmPasswordInput"
//                 type={'password'}
//                 defaultName="confirmpassword"
//                 register={register}
//                 name="Confirm Password"
//                 required={true}
//                 pattern={null}
//                 errors={errors}
//                 placeholder="********"
//                 setError={setError}
//                 clearError={clearErrors}
//                 autoComplete="off"
//                 classes={`rounded-md px-3 py-2 text-sm w-full bg-white text-black`}
//                 onChangeInput={null}
//                 setValue={setValue}
//               />
//               <span id="errors"></span>

//               <button className="bg-black text-white rounded-md px-3 py-2 mt-5 text-sm w-full uppercase">
//                 <div className="flex gap-x-1 justify-center items-center">
//                   Sign Up
//                 </div>
//               </button>
//             </form>
//           </section>
//         </div>
//       </section>
//     </>
//   )
// }
// export default SignupForm

import { Fragment } from 'react'

const SignupForm = () => {
  return (
    <Fragment>
      <h1>Hello</h1>
    </Fragment>
  )
}

export default SignupForm

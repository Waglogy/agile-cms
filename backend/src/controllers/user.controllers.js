import queryExecutor from '../services/QueryExecutorFactory.js'
import AppError from '../utils/AppError.js'
import asyncHandler from '../utils/asyncHandler.js'
import joiValidator from '../utils/joiValidator.js'
import userRegistrationValidator from '../validator/userRegistration.validator.js'

export const registerSuperUser = asyncHandler(async (req, res) => {
  const validationResult = joiValidator(userRegistrationValidator, req)

  if (!validationResult.success)
    throw new AppError(400, 'Form validation failed', validationResult.errors)

  const isUserExists = await queryExecutor.findUser(
    validationResult.value.email
  )

  if (isUserExists)
    throw new AppError(400, 'registration failed', 'user alredy exists')

  const foo = await queryExecutor.registerSuperAdmin({
    ...validationResult.value,
  })

  console.log(foo)

  res.status(201).json({
    success: true,
    message: 'super user registration successful',
  })
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await queryExecutor.getAllUsers()

  res.status(200).json({
    success: true,
    data: users,
  })
})

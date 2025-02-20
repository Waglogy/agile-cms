import queryExecutor from '../services/QueryExecutorFactory.js'
import AppError from '../utils/AppError.js'
import asyncHandler from '../utils/asyncHandler.js'
import joiValidator from '../utils/joiValidator.js'
import { signJwtPayload } from '../utils/jwt.util.js'
import userRegistrationValidator from '../validator/userRegistration.validator.js'

export const registerSuperUser = asyncHandler(async (req, res) => {
  const validationResult = joiValidator(
    userRegistrationValidator.signUpSuperAdmin,
    req
  )

  if (!validationResult.success)
    throw new AppError(400, 'Form validation failed', validationResult.errors)

  const isUserExists = await queryExecutor.findUser(
    validationResult.value.email
  )

  if (isUserExists)
    throw new AppError(400, 'registration failed', 'user alredy exists')

  const foo = await queryExecutor.registerSuperAdmin(
    validationResult.value.first_name,
    validationResult.value.last_name,
    validationResult.value.email,
    validationResult.value.password
  )

  if (!foo) throw new AppError(400, 'registration failed', null)

  res.status(201).json({
    success: true,
    message: 'super user registration successful',
  })
})

export const loginUser = asyncHandler(async (req, res) => {
  const validationResult = joiValidator(
    userRegistrationValidator.loginSuperAdmin,
    req
  )

  if (!validationResult.success)
    throw new AppError(400, 'login failed', validationResult.errors)

  const { email, password } = validationResult.value

  const userAuthenticationResult = await queryExecutor.authenticateUser(
    email,
    password
  )

  if (!userAuthenticationResult)
    throw new AppError(400, 'login failed', 'invalid credentials')

  const fetchUserRole = await queryExecutor.getUserRole(email)

  userAuthenticationResult.role = fetchUserRole

  const token = signJwtPayload(userAuthenticationResult)

  return res.status(200).json({
    success: true,
    message: 'login successful',
    token,
  })
})

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await queryExecutor.getAllUsers()

  res.status(200).json({
    success: true,
    data: users,
  })
})

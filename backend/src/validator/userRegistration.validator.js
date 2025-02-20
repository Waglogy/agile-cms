import Joi from 'joi'

const userRegistrationValidator = {
  signUpSuperAdmin: Joi.object({
    first_name: Joi.string().min(3).max(25).required(),
    last_name: Joi.string().min(3).max(25).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),

  loginSuperAdmin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
}

export default userRegistrationValidator

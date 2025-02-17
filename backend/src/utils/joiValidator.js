const joiValidator = (schema, req) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false })

  if (error) {
    return {
      success: false,
      errors: error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message.replace(/"/g, ''), 
      })),
    }
  }

  return { success: true, value }
}

export default joiValidator

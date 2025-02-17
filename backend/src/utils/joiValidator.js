export default joiValidator = (schema, req) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
  })

  if (error) {
    return {
      success: false,
      errors: error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message.replace(/"/g, ''), // Clean up the error message
      })),
    }
  }

  return { success: true, value }
}

import Joi from 'joi'

export const collectionValidation = {
  createTable: Joi.object({
    tableName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    schema: Joi.object()
      .pattern(
        Joi.string(),
        Joi.object({
          type: Joi.string()
            .valid(
              'TEXT',
              'INTEGER',
              'BOOLEAN',
              'TIMESTAMP',
              'DATE',
              'NUMERIC',
              'JSONB'
            )
            .required(),
          constraints: Joi.string().allow('').optional(),
        })
      )
      .required(),
  }),

  /* insertData: Joi.object({
    tableName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    data: Joi.object().min(1).required(),
  }),
 */

  insertData: (data) => {
    const schemaShape = {}

    // Dynamically create validation rules based on input fields
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        schemaShape[key] = Joi.string().required()
      } else if (typeof value === 'number') {
        schemaShape[key] = Joi.number().required()
      } else if (typeof value === 'boolean') {
        schemaShape[key] = Joi.boolean().required()
      } else if (value instanceof File) {
        schemaShape[key] = Joi.any() // Allow file uploads
      } else {
        schemaShape[key] = Joi.any().required() // Default case for unknown types
      }
    }

    return Joi.object(schemaShape)
  },

  updateData: Joi.object({
    tableName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    id: Joi.number().integer().positive().required(),
    updateData: Joi.object().min(1).required(),
  }),

  deleteData: Joi.object({
    tableName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    id: Joi.number().integer().positive().required(),
  }),

  alterCollection: Joi.object({
    tableName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    columnName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    columnType: Joi.string()
      .valid(
        'TEXT',
        'INTEGER',
        'BOOLEAN',
        'TIMESTAMP',
        'DATE',
        'NUMERIC',
        'JSONB'
      )
      .required(),
    constraints: Joi.string().allow('').optional(),
  }),
}

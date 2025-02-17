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

  insertData: Joi.object({
    tableName: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    data: Joi.object().min(1).required(),
  }),

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

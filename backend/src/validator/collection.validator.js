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

  dynamicSchema: (collection) => {
    console.log(collection)

    const schemaObject = {}

    collection.forEach(({ column_name, data_type }) => {
      let joiType

      switch (data_type.toLowerCase()) {
        case 'integer':
        case 'numeric':
          joiType = Joi.number().integer()
          break

        case 'text':
        case 'varchar':
        case 'char':
        case 'uuid':
          joiType = Joi.string()
          break

        case 'boolean':
          joiType = Joi.boolean()
          break

        case 'timestamp':
        case 'date':
        case 'timestamp without time zone': // ✅ Handles "timestamp without time zone"
          joiType = Joi.date()
          break

        case 'jsonb':
        case 'json':
          joiType = Joi.alternatives().try(Joi.object(), Joi.array()) // ✅ Supports objects & arrays
          break

        default:
          joiType = Joi.any() // Fallback for unknown types
      }

      // If column name is "id", make it optional (assuming auto-generated)
      schemaObject[column_name] =
        column_name === 'id' || column_name === 'image'
          ? joiType.optional()
          : joiType.required()
    })

    return Joi.object({
      collectionName: Joi.string().optional(), // ✅ Added collectionName as optional
      // image: Joi.optional(),
      ...schemaObject,
    })
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

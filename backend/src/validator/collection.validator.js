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
          is_multiple: Joi.boolean().optional(),
          required: Joi.boolean().default(false), //  Required flag validation
        })
      )
      .required(),
  }),

  dynamicSchema: (collection) => {
    const schemaObject = {}

    collection.forEach(({ column_name, data_type, required }) => {
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
        case 'timestamp without time zone':
          joiType = Joi.date()
          break

        case 'jsonb':
        case 'json':
          joiType = Joi.alternatives().try(Joi.object(), Joi.array())
          break

        default:
          joiType = Joi.any() // Fallback for unknown types
      }

      // If column is "id" or "image", make it optional, otherwise enforce required flag
      schemaObject[column_name] =
        column_name === 'id' || column_name === 'image'
          ? joiType.optional()
          : required
            ? joiType.required()
            : joiType.optional()
    })

    return Joi.object({
      collectionName: Joi.string().optional(),
      multiple: Joi.boolean().optional(),
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
  action: Joi.string()
    .valid('add', 'drop', 'rename', 'type', 'comment')
    .required(),

  tableName: Joi.string()
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    .required(),

  columnName: Joi.when('action', {
    is: Joi.valid('add', 'drop', 'rename', 'type', 'comment'),
    then: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    otherwise: Joi.forbidden(),
  }),

  columnType: Joi.when('action', {
    is: Joi.valid('add', 'type'),
    then: Joi.string()
      .valid('TEXT', 'INTEGER', 'BOOLEAN', 'TIMESTAMP', 'DATE', 'NUMERIC', 'JSONB')
      .required(),
    otherwise: Joi.string().optional(),
  }),

  constraints: Joi.string().allow('', null).optional(),

  newName: Joi.when('action', {
    is: 'rename',
    then: Joi.string()
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
      .required(),
    otherwise: Joi.string().optional(),
  }),

  comment: Joi.string().allow('', null).optional(),
}),

}

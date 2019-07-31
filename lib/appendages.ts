export {
  listQuery,
  dateParam,
  groupParam,
  bearerAuth,
  currencyParam,
  makeWrappedProperties,
}

function currencyParam(name, defaultValue) {
  return {
    in: 'path',
    name,
    required: true,
    allowEmptyValue: false,
    schema: {
      default: defaultValue,
      type: 'string',
    },
  }
}

function listQuery(name) {
  return {
    name,
    in: 'query',
    required: false,
    allowEmptyValue: true,
    type: 'array',
    items: {
      type: 'string',
    },
  }
}

function dateParam(name, extension = {}) {
  return Object.assign({
    name,
    in: 'path',
    required: true,
    allowEmptyValue: true,
    schema: {
      oneOf: [{
        type: 'string',
        format: 'date',
      }, {
        type: 'integer',
      }],
    },
  }, extension)
}

function groupParam({
  name,
  defaultValue,
  list,
}) {
  const schema = {
    default: defaultValue,
    type: 'string',
    enum: [],
  }
  if (list) {
    schema.enum = list
  }
  return {
    name,
    in: 'path',
    required: true,
    allowEmptyValue: false,
    schema,
  }
}

function bearerAuth() {
  return {
    in: 'header',
    name: 'Authorization',
    required: true,
    description: 'An Authorization Header',
    default: 'Bearer foobarfoobar',
    type: 'string',
  }
}

function makeWrappedProperties(appendage) {
  const responseProperties = ['lastUpdated', 'payload']
  return {
    type: 'object',
    required: responseProperties,
    properties: {
      value: appendage,
      lastUpdated: {
        type: 'string',
        format: 'date-time',
      },
    },
  }
}

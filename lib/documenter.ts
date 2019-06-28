import _ from 'lodash'
import joiToJSONSchema from 'joi-to-json-schema'
import * as defaults from './defaults'
import swaggerUI from 'swagger-ui-express'

const responseProperties = ['lastUpdated', 'payload']
const input = (inputKey) => function (key: string, option?: object | Function) {
  const { [inputKey]: param } = this.inputs
  if (typeof option === 'function') {
    param[key] = option
    return this
  }
  const handler = param[key]
  if (!handler) {
    throw new Error(`param ${key} not defined`)
  }
  return handler(option)
}

const param = input('param')
const query = input('query')

class Documenter {
  static baseRoute
  state: FullState;
  inputs: InputOptions;
  param = input('param')
  query = input('query')

  constructor (
    options: DocumenterOptions = {},
    inputs: InputOptions = {
      param: {},
      query: {}
    }
  ) {
    const doc = this
    doc.inputs = inputs
    doc.state = _.extend({
      swaggerOptions: {},
      schemes: options.secure ? ['https'] : ['http'],
      basePath: '/',
      info: defaults.info,
      tags: defaults.tags
    }, options, {
      swagger: '2.0.0',
      paths: {}
    })
  }

  route() {
    return swaggerUI.setup(this, this.state.swaggerOptions)
  }

  toJSON () {
    return this.state
  }

  document () {
    const documenter = this
    return function (options: Path = {}) {
      const route = this
      const {
        endpoint,
        method
      } = parseRoute(route)
      const {
        state
      } = documenter
      const {
        paths,
        definitions
      } = state
      const {
        [endpoint]: path = {}
      } = paths
      paths[endpoint] = path
      path[method] = baseRoute(options)
    }
  }
}

export default Documenter

function parsePathParams (path) {
  const split = path.split('/')
  return split.map((folder) => {
    if (folder[0] === ':') {
      let sub = folder.slice(1)
      const lastIndex = sub.length - 1
      const optional = sub[lastIndex] === '?'
      sub = optional ? sub.slice(0, lastIndex) : sub
      return `{${sub}${optional ? '?' : ''}}`
    }
    return folder
  }).join('/')
}

function parseRoute (pathway) {
  const route = pathway.stack[0].route
  const handler = route.stack[0]
  const { path } = route
  const endpoint = parsePathParams(path)
  const { method } = handler
  return {
    method,
    endpoint
  }
}

function baseRoute ({
  tags = ['examples'],
  summary = 'example summary',
  description = 'example description',
  parameters = [],
  responses = {}
}) : Path {
  return {
    tags: [].concat(tags),
    summary,
    description,
    parameters: [].concat(parameters),
    responses: _.mapValues(responses, (item) => Object.assign({
      description: 'an example route response description'
    }, item, item.schema ? {
      schema: joiToJSONSchema(item.schema)
    } : {}))
  }
}

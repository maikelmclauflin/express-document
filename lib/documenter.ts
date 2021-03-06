import { METHODS } from 'http'
import joiToJSONSchema from 'joi-to-json-schema'
import {
  cloneDeep,
  extend,
  isString,
  mapValues,
  merge,
  noop,
} from 'lodash'
import { join } from 'path'
import swaggerUI from 'swagger-ui-express'
import * as defaults from './defaults'
import * as interfaces from './interfaces'

const responseProperties = ['lastUpdated', 'payload']
const param = input('param')
const query = input('query')

export default class Documenter {
  public static baseRoute
  public options: interfaces.DocumenterOptions
  public state: interfaces.FullState
  public inputs: interfaces.InputOptions
  public param = input('param')
  public query = input('query')

  constructor(
    options: interfaces.DocumenterOptions,
    express,
  ) {
    const doc = this
    doc.options = options
    doc.reset()
  }

  public route(setups?: Array<() => void>): interfaces.Router[] {
    const routes = setups || this.inputs.routes
    routes.forEach((setup) => setup())
    const swaggerRoute = swaggerUI.setup(this, this.state.swaggerOptions)
    return [swaggerUI.serve, swaggerRoute]
  }

  public toJSON() {
    return this.state
  }

  public set(hash: object): void {
    merge(this.state, cloneDeep(hash))
  }

  public basePath(): string {
    return this.state.basePath
  }

  public wrapExpressMethods(list: string[], express) {
    const {
      Router,
      Route,
    } = express
    list.forEach((method) => {
      const key = method.toLowerCase()
      Route.prototype[key] = make(Route.prototype[key])
      Router[key] = make(Router[key])

      function make(fn: (() => any)) {
        return function(path) {
          const docPathEnabled = method === 'use' && typeof path === 'string'
          searchForRouters([].slice.apply(arguments), (route) => {
            const { parents = [] } = route
            parents.push({
              path: docPathEnabled ? path : '/',
              target: this,
            })
            route.parents = parents
          })
          return fn.apply(this, arguments)
        }
      }
    })

    function searchForRouters(many: any[], fn: ((router) => void)) {
      for (const item of many) {
        if (Array.isArray(item)) {
          searchForRouters(item, fn)
        } else {
          const { stack, route } = item
          if (Array.isArray(stack)) {
            searchForRouters(stack, fn)
          } else if (route instanceof Route) {
            fn(route)
          }
        }
      }
    }
  }

  public reset(opts: interfaces.DocumenterOptions = this.options) {
    const doc = this
    const options = cloneDeep(opts)
    const {
      secure,
    } = options
    const {
      info,
      tags,
    } = defaults
    doc.inputs = {
      routes: [],
      param: {},
      query: {},
    }
    doc.state = extend({
      disabled: false,
      swaggerOptions: {},
      schemes: secure ? ['https'] : ['http'],
      basePath: '/',
      info,
      tags,
    }, options, {
      swagger: '2.0.0',
      paths: {},
    })
  }

  public document(express: any): void {
    const documenter = this
    document.documenter = documenter
    const { Router, Route } = express
    const shouldDocument = true
    const documentMethod = documenter.state.disabled ? function() {
      return this
    } : document
    Router.document = documentMethod
    Route.prototype.document = documentMethod
    const methods = METHODS.concat(['all', 'use'])
    documenter.wrapExpressMethods(methods, express)

    function document(runner: ((a: interfaces.Documentable) => any) = noop): interfaces.Router {
      const router = this
      const todo = []
      documenter.inputs.routes.push(() => {
        recurse([router], routeStack)

        function recurse(stack, fn) {
          const topRoute = stack[0] // take the first one otherwise infinite loop
          const { parents } = topRoute
          if (!parents) {
            fn(stack)
          } else {
            for (const parent of parents) {
              recurse([parent].concat(stack), fn)
            }
          }
        }
      })
      const options: interfaces.Route = {}
      runner({
        router,
        param: input('param'),
        query: input('query'),
        response,
        set,
      })
      return router

      function set(opts) {
        extend(options, opts)
        return this
      }

      function routeStack(routes): void {
        const {
          endpoint,
          methods,
        } = parseStack(routes)
        for (const method of methods) {
          const {
            endpoint: point = endpoint,
          } = options
          const {
            state,
          } = documenter
          const {
            paths,
          } = state
          const {
            [point]: path = {},
          } = paths
          paths[point] = path
          const route = baseRoute(options)
          path[method] = route
          todo.forEach((fn) => fn(route))
        }
      }

      function response(status, options) {
        todo.push((route) => {
          const { responses } = route
          route.responses = responses
          responses[status] = normalizeResponse(options)
        })
        return this
      }

      function input(key: string) {
        return function(fn: string | object, ...args) {
          if (isString(fn)) {
            input('')(documenter[key](fn))
          } else {
            todo.push((route) => {
              route.parameters.push(fn)
            })
          }
          return this
        }
      }
    }
  }
}

function parsePathParams(path) {
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

function parseStack(routeStack) {
  return routeStack.reduce((memo, pathway) => {
    const { path, stack } = pathway
    if (pathway.path) {
      return parseRoute(memo, pathway)
    }
    const last = stack[stack.length - 1]
    return parseRoute(memo, last.route)
  }, {
    methods: [],
    endpoint: '',
  })
}

function parseRoute(memo, pathway) {
  const { methods, endpoint } = memo
  const { path, stack } = pathway
  let method = null
  if (stack && stack.length) {
    const handler = stack[0]
    method = handler.method
  }
  const step = parsePathParams(path)
  return {
    methods: methods.concat(method || []),
    endpoint: join(endpoint, step),
  }
}

function input(inputKey) {
  return function(key: string, option?: object | (() => void)) {
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
}

function baseRoute({
  tags = ['examples'],
  summary = 'example summary',
  description = 'example description',
  parameters = [],
  responses = {},
}): interfaces.Route {
  return {
    tags: [].concat(tags),
    summary,
    description,
    parameters: [].concat(parameters),
    responses: mapValues(responses, normalizeResponse),
  }
}

function normalizeResponse(item: interfaces.Response = {}) {
  const defaults = {
    description: 'an example route response description',
  }
  const overwrites = item.schema ? {
    schema: joiToJSONSchema(item.schema),
  } : {}
  return extend(defaults, item, overwrites)
}

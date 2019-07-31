import { METHODS } from 'http'
import joiToJSONSchema from 'joi-to-json-schema'
import _ from 'lodash'
import { join } from 'path'
import swaggerUI from 'swagger-ui-express'
import * as defaults from './defaults'
import * as interfaces from './interfaces'

const responseProperties = ['lastUpdated', 'payload']
const input = (inputKey) => function(key: string, option?: object | (() => void)) {
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
  public static baseRoute
  public state: interfaces.FullState
  public inputs: interfaces.InputOptions
  public param = input('param')
  public query = input('query')

  constructor(
    options: interfaces.DocumenterOptions = {},
  ) {
    const doc = this
    doc.inputs = {
      routes: [],
      param: {},
      query: {},
    }
    doc.state = _.extend({
      swaggerOptions: {},
      schemes: options.secure ? ['https'] : ['http'],
      basePath: '/',
      info: defaults.info,
      tags: defaults.tags,
    }, options, {
      swagger: '2.0.0',
      paths: {},
    })
  }

  public route(routers: interfaces.Router[]) {
    this.setup(routers)
    return swaggerUI.setup(this, this.state.swaggerOptions)
  }

  public toJSON() {
    return this.state
  }

  public basePath() {
    return this.state.basePath
  }

  public setup(routers: interfaces.Router[]) {
    // routers.forEach((router) => {
    //   recurseRoute(router, (route) => {
    //     console.log(route)
    //   })
    // })
    this.inputs.routes.forEach((setup) => setup())

    // function recurseRoute (router, fn) {
    //   console.log(router)
    //   router.stack.forEach((layer) => {
    //     const { name } = layer
    //     if (name === 'router') {
    //       layer.route.stack.forEach(fn)
    //     } else {
    //       console.log(name, layer)
    //     }
    //   })
    // }
  }

  public document(express: any): void {
    const documenter = this
    document.documenter = documenter
    const { Router, Route } = express
    Router.document = document
    Route.prototype.document = document
    METHODS.concat(['all', 'use']).forEach((method) => {
      const key = method.toLowerCase()
      Route.prototype[key] = make(Route.prototype[key])
      Router[key] = make(Router[key])

      function make(fn: (() => void)) {
        return function(path) {
          const docPathEnabled = method === 'use' && typeof path === 'string'
          searchForRouters([].slice.apply(arguments), (route) => {
            const { parents = [] } = route
            if (!parents.includes(this)) {
              parents.push({
                path: docPathEnabled ? path : '/',
                target: this,
              })
            }
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

    function document(options: interfaces.Route = {}): interfaces.RouteSetup {
      const router = this
      const todo = []
      documenter.inputs.routes.push(() => {
        recurse([router], routeStack)

        function recurse(routeStack, fn) {
          const topRoute = routeStack[0]
          const { parents } = topRoute
          if (!parents) {
            fn(routeStack)
          } else {
            for (const parent of parents) {
              recurse([parent].concat(routeStack), fn)
            }
          }
        }
      })
      return {
        router,
        param: input,
        query: input,
        response,
      }

      function routeStack(routes) {
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
          const route = baseRoute(options || {})
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

      function input(fn) {
        todo.push((route) => {
          route.parameters.push(fn)
        })
        return this
      }
    }
  }
}

export default Documenter

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
    const first = stack[0]
    return parseRoute(memo, first.route || first)
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
    endpoint: join(endpoint, step || ''),
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
    responses: _.mapValues(responses, normalizeResponse),
  }
}

function normalizeResponse(item) {
  return Object.assign({
    description: 'an example route response description',
  }, item, item.schema ? {
    schema: joiToJSONSchema(item.schema),
  } : {})
}

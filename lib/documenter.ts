import joiToJSONSchema from "joi-to-json-schema"
import _ from "lodash"
import swaggerUI from "swagger-ui-express"
import * as defaults from "./defaults"
import * as interfaces from "./interfaces"

const responseProperties = ["lastUpdated", "payload"]
const input = (inputKey) => function(key: string, option?: object | (() => void)) {
  const { [inputKey]: param } = this.inputs
  if (typeof option === "function") {
    param[key] = option
    return this
  }
  const handler = param[key]
  if (!handler) {
    throw new Error(`param ${key} not defined`)
  }
  return handler(option)
}

const param = input("param")
const query = input("query")

class Documenter {
  public static baseRoute
  public state: interfaces.FullState
  public inputs: interfaces.InputOptions
  public param = input("param")
  public query = input("query")

  constructor(
    options: interfaces.DocumenterOptions = {},
  ) {
    const doc = this
    doc.inputs = {
      param: {},
      query: {},
    }
    doc.state = _.extend({
      swaggerOptions: {},
      schemes: options.secure ? ["https"] : ["http"],
      basePath: "/",
      info: defaults.info,
      tags: defaults.tags,
    }, options, {
      swagger: "2.0.0",
      paths: {},
    })
  }

  public route() {
    return swaggerUI.setup(this, this.state.swaggerOptions)
  }

  public toJSON() {
    return this.state
  }

  public basePath() {
    return this.state.basePath
  }

  public document(): interfaces.DocumentHandler {
    const documenter = this
    document.documenter = documenter
    return document

    function document(options?: interfaces.Route): interfaces.RouteSetup {
      const router = this
      const {
        endpoint,
        method,
      } = parseRoute(router)
      const {
        state,
      } = documenter
      const {
        paths,
        definitions,
      } = state
      const {
        [endpoint]: path = {},
      } = paths
      paths[endpoint] = path
      const route = baseRoute(options || {})
      path[method] = route
      return {
        route,
        router,
        param: input,
        query: input,
        response(status, options) {
          const { responses } = route
          route.responses = responses
          responses[status] = normalizeResponse(options)
          return this
        },
      }

      function input(fn) {
        route.parameters.push(fn)
        return this
      }
    }
  }
}

export default Documenter

function parsePathParams(path) {
  const split = path.split("/")
  return split.map((folder) => {
    if (folder[0] === ":") {
      let sub = folder.slice(1)
      const lastIndex = sub.length - 1
      const optional = sub[lastIndex] === "?"
      sub = optional ? sub.slice(0, lastIndex) : sub
      return `{${sub}${optional ? "?" : ""}}`
    }
    return folder
  }).join("/")
}

function parseRoute(pathway) {
  const route = pathway.stack[0].route
  const handler = route.stack[0]
  const { path } = route
  const endpoint = parsePathParams(path)
  const { method } = handler
  return {
    method,
    endpoint,
  }
}

function baseRoute({
  tags = ["examples"],
  summary = "example summary",
  description = "example description",
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
    description: "an example route response description",
  }, item, item.schema ? {
    schema: joiToJSONSchema(item.schema),
  } : {})
}

import Documenter from './documenter'
import swaggerUI from 'swagger-ui-express'
import globalExpress from 'express'
import * as interfaces from './interfaces'

export default expressDocumentRoute

function expressDocumentRoute(opts: interfaces.ModuleOptions = {}) {
  const {
    express = globalExpress,
    options,
    inputs
  } = opts
  const { Router } = express
  const documenter = new Documenter(options, inputs)
  Router.document = documenter.document()
  return documenter
}

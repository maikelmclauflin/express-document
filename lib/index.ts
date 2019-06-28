import Documenter from './documenter'
import swaggerUI from 'swagger-ui-express'
import globalExpress from 'express'

export default expressDocumentRoute

function expressDocumentRoute(opts: ModuleOptions = {}) {
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

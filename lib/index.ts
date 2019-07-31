import globalExpress from 'express'
import swaggerUI from 'swagger-ui-express'
import Documenter from './documenter'
import * as interfaces from './interfaces'

export default expressDocumentRoute

function expressDocumentRoute(
  options: interfaces.DocumenterOptions = {},
  express = globalExpress,
) {
  const Router: any = express.Router
  const document: interfaces.DocumentHandler | null = Router.document
  if (document) {
    return document.documenter
  }
  const documenter = new Documenter(options)
  documenter.document(express)
  return documenter
}

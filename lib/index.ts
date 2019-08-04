import globalExpress from 'express'
import swaggerUI from 'swagger-ui-express'
import Documenter from './documenter'
import * as interfaces from './interfaces'

expressDocumentRoute.Documenter = Documenter

export default expressDocumentRoute
export * from './interfaces'

function expressDocumentRoute(
  options: interfaces.DocumenterOptions = {},
  express = globalExpress,
) {
  const Router: any = express.Router
  const document: interfaces.DocumentHandler | null = Router.document
  if (document) {
    return document.documenter
  }
  const doc = new Documenter(options, express)
  doc.document(express)
  return doc
}

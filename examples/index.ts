import expressDocument from '../lib/'
import express from 'express'
import swaggerUI from 'swagger-ui-express'
import empty from './empty'
import helloworld from './helloworld'
import * as interfaces from '../lib/interfaces'

const app = express()
const docPath = '/documentation/'
const baseRouter: interfaces.Router = new (express as any).Router()

const basePath = '/api/'
const documenter = expressDocument({
  basePath
})

documenter.param('firstname', () => ({
  in: 'path',
  name: 'firstname',
  required: true,
  allowEmptyValue: false,
  schema: {
    default: 'empty',
    type: 'string'
  }
}))

setup(empty)
setup(helloworld)

app.use(docPath, swaggerUI.serve, documenter.route())
app.use(basePath, baseRouter)

const port = 8080
app.listen(port, (err) => {
  if (err) {
    console.log(`unable to listen on port: ${port}`)
  } else {
    console.log('open your browser to http://localhost:8080/documentation/')
  }
})

function setup (setupRoute) {
  const router: interfaces.Router = new (express as any).Router()
  setupRoute({
    router,
    documenter
  })
  baseRouter.use(router)
}

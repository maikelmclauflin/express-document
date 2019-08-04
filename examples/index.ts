import express from 'express'
import expressDocument from '../lib/'
import * as interfaces from '../lib/interfaces'
import empty from './empty'
import helloworld from './helloworld'
import leveled from './leveled'
const anyExpress = (express as any)
const app = express()
const docPath = '/documentation/'
const baseRouter: interfaces.Router = new anyExpress.Router()

const basePath = '/api/'
const documenter = expressDocument({
  basePath,
})

documenter.param('firstname', () => ({
  in: 'path',
  name: 'firstname',
  required: true,
  allowEmptyValue: false,
  schema: {
    default: '',
    type: 'string',
  },
}))

documenter.param('status', () => ({
  in: 'path',
  name: 'status',
  required: true,
  allowEmptyValue: false,
  schema: {
    default: '200',
    type: 'number',
  },
}))

setup(empty)
setup(helloworld)
setup(leveled)
app.use(docPath, documenter.route())
app.use(basePath, baseRouter)

const port = 8080
app.listen(port, (err) => {
  if (err) {
    console.log(`unable to listen on port: ${port}`) // tslint:disable-line
  } else {
    console.log(`open your browser to http://localhost:${port}/documentation/`) // tslint:disable-line
  }
})

function setup(setupRoute) {
  const router: interfaces.Router = new anyExpress.Router()
  setupRoute({
    express: anyExpress,
    router,
    documenter,
  })
  baseRouter.use(router)
}

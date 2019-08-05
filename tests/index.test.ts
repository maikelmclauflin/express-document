// transformation happens to express module by default
import Joi from '@hapi/joi'
import * as express from 'express'
import * as _ from 'lodash'
import expressDocument from '../lib/'
import Documenter from '../lib/documenter'
import * as interfaces from '../lib/interfaces'
const anyExpress = express as any
const { Router } = anyExpress
const documenter = expressDocument()

describe('documenter', () => {
  test('can be created to respect https or not', () => {
    const secureDocumenter = new Documenter({
      secure: true,
    }, express)
    expect(secureDocumenter.state.schemes).toEqual(['https'])
    const insecureDocumenter = new Documenter({
      secure: false,
    }, express)
    expect(insecureDocumenter.state.schemes).toEqual(['http'])
  })
  test('can return the base path', () => {
    const documenter = new Documenter({}, express)
    expect(documenter.basePath()).toBe('/')
    const apiDocumenter = new Documenter({
      basePath: '/api/',
    }, express)
    expect(apiDocumenter.basePath()).toBe('/api/')
  })
  test('pass disabled to noop your documentation', async () => {
    documenter.reset({
      disabled: true,
    })
    documenter.document(express)
    const route = Router()
    route.get('/a', _.noop)
      .document()
    documenter.route()
    documenter.reset()
    documenter.document(express)
  })
})

describe('setup', () => {
  let router
  const born = {}
  const name = {
    allowEmptyValue: false,
    in: 'path',
    name: 'firstname',
    required: true,
    schema: {
      default: 'empty',
      type: 'string',
    },
  }
  beforeEach(() => {
    router = Router()
    documenter.reset()
    documenter.param('name', () => name)
    documenter.query('born', () => born)
  })
  test('running twice produces the same documenter (one per process)', () => {
    const documenter2 = expressDocument()
    expect(documenter).toBe(documenter2)
  })
  test('a document fn is added to router\'s future prototype', () => {
    expect(Router.document).toBeInstanceOf(Function)
  })
  test('inputs can be created and used', () => {
    expect(documenter.param('name')).toBe(name)
    expect(() => documenter.param('noexist')).toThrow()
    expect(documenter.query('born')).toBe(born)
  })
  test('sends back a route to be used to serve the interface', async () => {
    router.use(documenter.route())
  })
  test('which allows it to be called on new routes', async () => {
    const router = Router()
    router
      .get('/a/path', (req, res, next) => res.send('fin'))
      .document()
    documenter.route()
  })
  test('provides default values for responses', async () => {
    router
      .get('/a', _.noop)
      .document((endpoint) => endpoint.response(200))
    documenter.route()
  })
  test('takes a whole host of inputs', async () => {
    router
      .get('/a/:name', (req, res, next) => res.send('fin'))
      .document((endpoint) => endpoint
        .response(200, {
          description: 'takes a name',
          schema: Joi.string().allow(''),
        }),
      )
    documenter.route()
  })
  test('optional routes can be handled too', async () => {
    router
      .get('/a/:name?', (req, res, next) => next())
      .document((endpoint) => endpoint
        .response(200, {
          description: 'takes a name',
          schema: Joi.string().allow('', null),
        })
        .param('name', {}),
      )
    documenter.route()
  })
  test('a validation schema does not have to be provided', async () => {
    router
      .get('/a/:name?', (req, res, next) => next())
      .document((endpoint) => endpoint
        .response(200, {
          description: 'takes a name',
        }),
      )
    documenter.route()
  })
  test('check responses already exists case', async () => {
    router
      .get('/a/:name?', (req, res, next) => next())
      .document((endpoint) => endpoint
        .response(200, {
          description: 'takes a name',
        }),
      )
    documenter.route()
  })
  test('using routes with multiple methods is ok too', async () => {
    router
      .route('/c')
      .get(_.noop)
      .document((endpoint) => endpoint)
    documenter.route()
  })
  test('properties can be set to describe the endpoint', async () => {
    router.route('/a')
      .get(_.noop)
      .document((endpoint) => endpoint
        .set({
          summary: 'it was a good day',
          decription: 'all of the apis worked and everyone knew what they did',
        }),
      )
    documenter.route()
  })
  test('layered routes can exist', async () => {
    const subRouter = Router()
    const parentRouter = Router()
    const rootRouter = Router()
    subRouter
      .route('/products/:productId')
      .get(_.noop)
      .document()
    parentRouter.use('/user/:userId', subRouter)
    rootRouter.use('/api/', parentRouter)
    documenter.route()
  })
  test('layered routes with merged params work', async () => {
    const subRouter = Router()
    const parentRouter = Router()
    const rootRouter = Router()
    subRouter
      .route('/products/:productId')
      .get(_.noop)
      .document()
    parentRouter.use('/user/:userId', subRouter)
    rootRouter.use(subRouter)
    documenter.route()
  })
  test('layered routes filter out duplicate parents', async () => {
    const subRouter = Router()
    const parentRouter = Router()
    const rootRouter = Router()
    subRouter
      .route('/a/:b')
      .get(_.noop)
      .document()
    parentRouter.use('/c/:d', subRouter)
    rootRouter.use([subRouter, parentRouter])
    documenter.route()
  })
  test('values like `basePath` can be set outside of the constructor', async () => {
    documenter.set({
      basePath: '/api/',
    })
  })
})

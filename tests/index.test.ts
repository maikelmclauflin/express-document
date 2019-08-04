// transformation happens to express module by default
import Joi from '@hapi/joi'
import express from 'express'
import expressDocument from '../lib/'
import Documenter from '../lib/documenter'
import * as interfaces from '../lib/interfaces'
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
})

describe('setup', () => {
  test('running twice produces the same documenter (one per process)', () => {
    const documenter2 = expressDocument()
    expect(documenter).toBe(documenter2)
  })
  test('a document fn is added to router\'s future prototype', () => {
    expect((express as any).Router.document).toBeInstanceOf(Function)
  })
  test('sends back a route to be used to serve the interface', async () => {
    const router: interfaces.Router = new (express as any).Router()
    router.use(documenter.route())
  })
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
  const born = {}
  test('inputs can be created and used', () => {
    documenter.param('name', () => name)
    expect(documenter.param('name')).toBe(name)
    expect(() => documenter.param('noexist')).toThrow()
    documenter.query('born', () => born)
    expect(documenter.query('born')).toBe(born)
  })
  test('which allows it to be called on new routes', async () => {
    const router: interfaces.Router = new (express as any).Router()
    router
      .get('/a/path', (req, res, next) => res.send('fin'))
      .document()
  })
  test('takes a whole host of inputs', async () => {
    const router: interfaces.Router = new (express as any).Router()
    router
      .get('/a/:name', (req, res, next) => res.send('fin'))
      .document({
        responses: {
          200: {
            description: 'takes a name',
            schema: Joi.string().allow(''),
          },
        },
      })
  })
  test('optional routes can be handled too', async () => {
    const router: interfaces.Router = new (express as any).Router()
    router
      .get('/a/:name?', (req, res, next) => next())
      .document()
      .response(200, {
        description: 'takes a name',
        schema: Joi.string().allow('', null),
      })
      .param('name', {})
  })
  test('a validation schema does not have to be provided', async () => {
    const router: interfaces.Router = new (express as any).Router()
    router
      .get('/a/:name?', (req, res, next) => next())
      .document()
      .response(200, {
        description: 'takes a name',
      })
  })
  test('check responses already exists case', async () => {
    const router: interfaces.Router = new (express as any).Router()
    router
      .get('/a/:name?', (req, res, next) => next())
      .document({
        responses: {},
      })
      .response(200, {
        description: 'takes a name',
      })
  })
})

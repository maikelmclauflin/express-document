// transformation happens to express module by default
import Joi from '@hapi/joi'
import expressDocument from '../lib/'
import Documenter from '../lib/documenter'
import express from 'express'
const { Router } = express
const documenter = expressDocument()

describe('documenter', () => {
  test('can be created to respect https or not', () => {
    const secureDocumenter = new Documenter({
      secure: true
    })
    expect(secureDocumenter.state.schemes).toEqual(['https'])
    const insecureDocumenter = new Documenter({
      secure: false
    })
    expect(insecureDocumenter.state.schemes).toEqual(['http'])
  })
})

describe('setup', () => {
  test('a document fn is added to router\'s future prototype', () => {
    expect(express.Router.document).toBeInstanceOf(Function)
  })
  test('sends back a route to be used to serve the interface', async () => {
    const router = new express.Router()
    router.use(documenter.route())
  })
  const name = {
    in: 'path',
    name: 'firstname',
    required: true,
    allowEmptyValue: false,
    schema: {
      default: 'empty',
      type: 'string'
    }
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
    const router = new express.Router()
    router
      .get('/a/path', (req, res, next) => next())
      .document()
  })
  test('takes a whole host of inputs', async () => {
    const router = new express.Router()
    router
      .get('/a/:name', (req, res, next) => next())
      .document({
        responses: {
          '200': {
            description: 'takes a name',
            schema: Joi.string().allow('')
          }
        }
      })
  })
  test('optional routes can be handled too', async () => {
    const router = new express.Router()
    router
      .get('/a/:name?', (req, res, next) => next())
      .document({
        responses: {
          '200': {
            description: 'takes a name',
            schema: Joi.string().allow('', null)
          }
        }
      })
  })
  test('a validation schema does not have to be provided', async () => {
    const router = new express.Router()
    router
      .get('/a/:name?', (req, res, next) => next())
      .document({
        responses: {
          '200': {
            description: 'takes a name'
          }
        }
      })
  })
})

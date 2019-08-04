# express-document

document your express routes quickly and completely with a swagger implementation directly in your route

```js
// server.js
import express from 'express'
import swaggerUI from 'swagger-ui-express'
// must run before apis
import documenter from './documenter'
import apiRouter from './routes'

const basePath = '/api/'
documenter.set({
  basePath,
})
const app = express()
app.use('/documentation/', swaggerUI.serve, documenter.route())
app.use(basePath, apiRouter)
app.listen(8080)
```
```js
import expressDocumenter from 'express-document'
const documenter = expressDocumenter()
documenter.param('name', () => ({
  in: 'path',
  name: 'name',
  required: false,
  allowEmptyValue: false,
  schema: {
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
export default documenter
```
```js
// routes.js
import express from 'express'
import Joi from '@hapi/joi'
import subRouter from './subrouter'
const router = new express.Router({
  mergeParams: true,
})
export default router
router
  .use('/reply/:status', subRouter)
```

```js
// subroutes.js
import express from 'express'
import Joi from '@hapi/joi'
import documenter from './documenter'
const subRouter = new express.Router()
export default subRouter
subRouter.get('/hello/:name?', (req, res, next) => {
  const {
    name = 'user',
    status
  } = req.params
  const response = `Hello ${name}.`
  res.status(status).send(response)
})
  .document()
  .param('status')
  .param(documenter.param('name'))
  .response(200, {
    schema: Joi.string()
  })
```

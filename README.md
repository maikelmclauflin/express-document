# express-document

document your express routes quickly and completely with a swagger implementation directly in your route

to help develop the project
```bash
npm install
npm test
```

don't forget your peer dependency
```bash
npm i -s express-document express
```

### API
todo

### Example

check out the examples folder for more setup examples
```js
// server.js
import express from 'express'
import documenter from './documenter'
import apiRouter from './routes'

const basePath = '/api/'
documenter.set({
  basePath,
})
const app = express()
// setup everything before documenter.route()
app.use('/documentation/', documenter.route())
app.use(basePath, apiRouter)
app.listen(8080)
```

a documenter needs any params to be referenced on routes to be set on the documenter itself. The example at the bottom of the Path Item Object section of the swagger OAS 3 is a good reference: https://swagger.io/specification/#pathItemObject
```js
// documenter.js
import expressDocumenter from 'express-document'
const documenter = expressDocumenter()
documenter.param('name', ({
  required = true,
}) => ({
  in: 'path',
  name: 'name',
  required,
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

routers' `.use(` method helps define how to structure the full path of a single route
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

subroutes will be available and show up correctly (in this case `/reply/{status}/hello/{name?}`), even though, in the subrouter module, you do not have the full path.
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
    status // comes from parent route
  } = req.params
  const response = `Hello ${name}.`
  res.status(status).send(response)
})
  .document()
  // these params match the keys in documenter.js
  .param('status')
  .param(documenter.param('name', {
    required: false,
  }))
  .response(200, {
    schema: Joi.string()
  })
```

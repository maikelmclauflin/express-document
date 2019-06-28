# express-document

document your express routes quickly and completely with a swagger implementation directly in your route

```js
// server.js
import express from 'express'
import swaggerUI from 'swagger-ui-express'
// must run before apis
import documenter from './documenter'
import apiRouter from './api'

const app = express()
app.use('/documentation/', swaggerUI.serve, documenter.route())
app.use(documenter.basePath(), apiRouter)
app.listen(8080)
```

```js
// documenter.js
import expressDocument from 'express-document'
const basePath = '/api/'
export default expressDocument({
  basePath
})
```

```js
// api.js
import express from 'express'
import Joi from '@hapi/joi'
const router = new express.Router()
export default router
router
  .get('/my/path', (req, res, next) => res.send('fin'))
  .document()
  .response(200, {
    schema: Joi.string()
  })
```

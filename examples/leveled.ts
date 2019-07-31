import Joi from '@hapi/joi'
export default ({
  express,
  router,
  documenter,
}) => {
  const subRouter = express.Router({
    mergeParams: true, // don't forget to get params from parent
  })
  const joiString = Joi.string()
  const joiStatus200 = joiString
  const joiStatus422 = Joi.object().keys({
    message: joiString,
  })
  subRouter
    .route('/reply/:firstname')
    .get((req, res, next) => {
      const { firstname, status } = req.params
      res.status(+status).send(`Hello ${firstname}!`)
    })
    .document({
      endpoint: '/echo/{status}/reply/{firstname}',
      summary: 'Get a hello from the server',
      description: 'It is important that your api knows you by name. This endpoint ensures that you know that your server knows your name.',
    })
    .param(documenter.param('status'))
    .param(documenter.param('firstname'))
    .response(200, {
      schema: joiStatus200,
    })
  const parentRouter = express.Router()
  parentRouter.use('/echo/:status/', subRouter)
  router.use(parentRouter)
}

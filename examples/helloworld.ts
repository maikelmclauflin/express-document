import Joi from '@hapi/joi'
export default ({
  router,
  documenter,
}) => {
  router
    .get('/hello/:firstname', (req, res, next) => {
      const { firstname } = req.params
      if (firstname.match(/\d/igm)) {
        return res.status(422).json({
          message: 'first name is not valid',
        })
      }
      res.send(`Hello ${firstname}!`)
    })
    .document((endpoint) => endpoint
      .set({
        summary: 'Get a hello from the server',
        description: 'It is important that your api knows you by name. This endpoint ensures that you know that your server knows your name.',
      })
      .param(documenter.param('firstname'))
      .response(200, {
        schema: Joi.string(),
      })
      .response(422, {
        schema: Joi.object().keys({
          message: Joi.string(),
        }),
      }),
    )
}

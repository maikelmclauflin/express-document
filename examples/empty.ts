export default ({
  router,
}) => {
  router
    .get('/empty', (req, res, next) => res.send(`is complet`))
    .document()
}

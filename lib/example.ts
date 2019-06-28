
// router.get(
//   '/relative/history/single/:group1/:a/:group2/:b/:from',
//   log,
//   dateParamsGroupAB,
//   priceDateResponse,
//   history.singleRelativeCurrency
// )
// swagger.document('/relative/history/single/{group1}/{a}/{group2}/{b}/{from}', 'get', {
//   tags: ['history'],
//   summary: 'Historical data exists for this currency on this day relative to the base given',
//   description: 'Get the historical data for this currency on the given day relative to the base given',
//   parameters: [
//     swagger.param.group('group1', 'fiat'),
//     swagger.param.currency('a', 'USD'),
//     swagger.param.group('group2', 'alt'),
//     swagger.param.currency('b', 'BAT'),
//     swagger.param.date('from', {
//       allowEmptyValue: false
//     })
//   ],
//   responses: {
//     '200': {
//       description: 'A ratio is known for this currency under the return value',
//       schema: joiToJSONSchema(priceDate)
//     }
//   }
// })

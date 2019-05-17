const express = require('express')
const { gateway } = require('@moltin/sdk')

// omise user (for testing purpose)
// email devincube@yopmail.com
// password Devincube123!
const Omise = require('omise')({
  'secretKey': 'skey_test_5fx8usmeiblvkw9y1gv',
  'omiseVersion': '2015-09-10',
})
const Moltin = new gateway({
  client_id: 'PCvuouFCdj4Pii5AZTJj6zgMzNPIn1ooAVdHjJatNF',
  client_secret: 'LflDcU8GxdMdvD8a43rnNhsAZJW6IyA9ZibYyjJnUP',
  grant_type: 'client_credentials'
})

var app = express();

app.post('/moltinPayment/:orderId', async (req, res) => {
  const {
    orderId
  } = req.params;
  const {
    card
  } = req.body
  console.debug(`making payment for orderId: ${orderId}`)
  try {
    const transactionResponse = await Moltin.Orders.Payment(orderId, {
      gateway: 'manual',
      method: 'authorize'
    })
    // get cart total amount
    const order = await Moltin.Orders.Get(orderId)
    console.debug(`order info`, order)
    const priceWithTax = order.data.meta.display_price.with_tax
    const {
      amount,
      currency
    } = priceWithTax
    const omiseResult = await Omise.charges.create({
      amount,
      currency,
      capture: true,
      card,
      description: `Payment for Motlin order ${orderId}`
    })
    const captureResponse = await Moltin.Transactions.Capture({
      order: orderId,
      transaction: transactionResponse.data.id
    })
    return res.json(captureResponse.data)
  } catch (e) {
    return res.status(e.status).send(e.message)
  }
})

module.exports = app

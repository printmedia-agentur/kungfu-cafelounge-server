const User = require('../models/User'); // Import User Model Schema
const stripe = require('stripe')(process.env.stripeApiKey);
var MY_SLACK_WEBHOOK_URL = process.env.slackApiKey;
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

module.exports = (router) => {

  router.post('/charge/authorize', (req, res) => {
    // Check if .. was provided
    if (!req.body.stripeId) {
      res.json({
        success: false,
        message: 'You must provide a stripe id'
      }); // Return error
    } else {
      if (!req.body.stripeId) {
        res.json({
          success: false,
          message: 'You must provide a token'
        }); // Return error
      } else {
        if (!req.body.amount) {
          res.json({
            success: false,
            message: 'You must provide an amount'
          }); // Return error
        } else {
          stripe.customers.update(req.body.stripeId, {
            source: req.body.stripeToken,
          }).then(customer =>
            stripe.charges.create({
              amount: req.body.amount,
              capture: false,
              currency: "eur",
              customer: customer.id,
              description: req.body.description,
            }))
            .then(charge => {
              res.json({
                chargeId: charge.id,
                success: true,
                message: 'Autorisieren der Zahlung erfolgreich.',
              })
            })
            .catch(err => {
              console.log("Error:", err);
              res.json({
                success: false,
                message: 'Es ist ein Problem beim Autorisieren der Zahlung aufgetreten.',
                error: 'Error: ' + err
              })
            });
        }
      }
    }
  });

  router.post('/charge/debit', (req, res) => {
    // Check if .. was provided
    if (!req.body.chargeId) {
      res.json({
        success: false,
        message: 'You must provide a charge id'
      }); // Return error
    } else {
      stripe.charges.capture(req.body.chargeId)
        .then(charge => {
          res.json({
            chargeId: charge.id,
            success: true,
            message: 'Belastung der Kreditkarte erfolgreich.',
          })
        })
        .catch(err => {
          console.log("Error:", err);
          res.json({
            success: false,
            message: 'Es ist ein Problem bei der Belastung der Kreditkarte aufgetreten.',
            error: 'Error: ' + err
          })
        })
    }
  });

  router.post('/refund', (req, res) => {
    // Check if .. was provided
    if (!req.body.chargeId) {
      res.json({
        success: false,
        message: 'You must provide a charge id'
      }); // Return error
    } else {
      stripe.refunds.create({
        charge: req.body.chargeId,
      }).then(refund => {
        console.log(refund.id);
        console.log(refund.status);
        res.json({
          refundId: refund,
          success: true,
          message: 'Autorisieren der Zahlung erfolgreich.',
        })
      })
        .catch(err => {
          console.log("Error:", err);
          res.json({
            success: false,
            message: 'Es ist ein Problem beim Autorisieren der Zahlung aufgetreten.',
            error: 'Error: ' + err
          })
        });
    }
  });

  router.post('/charge/certificate');

  return router;
};

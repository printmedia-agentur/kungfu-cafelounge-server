const User = require('../models/User'); // Import User Model Schema
const emailConfirmationToken = require('../models/MailToken'); // Import Token Model Schema
var crypto = require('crypto');
var nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims to be transferred between two parties.
// const config = require('../config/database'); // Import database configuration

module.exports = router => {

  /* ===============================================================
       Route to confirm user account through email
  =============================================================== */
  router.post('/email', (req, res) => {
    var emailToken = req.body.token;
    if (!emailToken) {
      console.log('hast du' + emailToken + '?');
      res.json({
        success: false,
        message: 'No confirmation token was provided'
      }); // Return error message
    } else {
      console.log('hast du' + emailToken + '?');
      // Check the database for username
      emailConfirmationToken.findOne({
        token: emailToken
      }, function (err, token) {
        if (!token) {
          res.json({
            success: false,
            message: 'der token wurde net gefunden ode rist vielleuchz schon agelaufen (24h)h'
          }); // Return error message
        } else {
          User.findOne({
            _id: token._userId
          }, function (err, user) {
            if (!user) {
              res.json({
                success: false,
                message: 'es wurde kein benutzer für diesentoken gefunden'
              }); // Return error message
            } else {
              if (user.isEmailVerified) {
                res.json({
                  success: false,
                  message: 'dieser account wurde bereits bestätigt'
                }); // Return error message
              } else {
                user.isEmailVerified = true;
                console.log(user);
                User.update({
                    $set: {
                      isEmailVerified: true
                    }
                  },
                  function (err, user) {
                    if (err) {
                      res.json({
                        success: false,
                        message: 'es ist ein fehler aufgereten'
                      }); // Return error message
                    } else {
                      res.json({
                        success: true,
                        message: 'email adressse bestätigt'
                      }); // Return error message
                    }
                  });
              }
            }
          });
        }
      });
    }
  });

  /* ===============================================================
     Route to confirm user account through email
  =============================================================== */
  // TODO: resend email token
  router.post('/resend', (req, res) => {
    const email = req.body.email;
    console.log(email)
    if (!email) {
      res.json({
        success: false,
        message: 'No mail was provided'
      }); // Return error message
    } else {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          res.json({
            success: false,
            message: 'es wurde kein benutzer mit dieser mail gefunden'
          }); // Return error message
        } else {
          if (user.isEmailVerified) {
            res.json({
              success: false,
              message: 'diese mail wurde bereits bestätigt'
            }); // Return error message
          } else {
            // Create a verification token, save it, and send email
            var token = new emailConfirmationToken({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
            // Save the token
            token.save(function (err) {
              if (err) { return res.status(500).send({ msg: err.message }); }
              // Send the email
              // Send the email
              var transporter = nodemailer.createTransport({
                host: process.env.hostSmtp,
                port: 465,
                secure: true,
                auth: {
                  type: 'custom',
                  user: process.env.usernameSmtp,
                  pass: process.env.passwortSmtp,
                }
              });
              if (process.env.NODE_ENV === 'development') {
                var mailOptions = {
                  from: process.env.emailName,
                  to: user.email,
                  subject: 'Bitte bestätigen Sie Ihren Account',
                  text: 'Hallo ' + user.firstName + ' ' + user.lastName + ',\n\n' + 'bitte bestätigen Sie Ihren neuen myHEALFORM Account indem Sie den folgenden Link anklicken: \nhttp://localhost:4200/#/app/verify/email/' + token.token + '.\n'
                };
              } else {
                if (process.env.NODE_ENV === 'production') {
                  // TODO: implement prod mail
                  console.log('NOT IMPLEMENTED')
                }
              }
              transporter.sendMail(mailOptions, function (err) {
                if (err) {
                  return res.status(500).send({
                    msg: err.message
                  });
                }
                res.json({
                  success: true,
                  message: 'Eine Bestätigungs-Mail wurde an ' + user.email + ' gesendet.'
                }); // Return error message
              });
            });
          }
        }
      });
    }
  });

  return router; // Return router object to main index.js
};

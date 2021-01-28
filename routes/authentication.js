const User = require('../models/User');
const emailConfirmationToken = require('../models/MailToken');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const randtoken = require('rand-token');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const express = require('express');
const router = express.Router();

const refreshTokens = {};

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
var MY_SLACK_WEBHOOK_URL = process.env.SLACK_API_KEY;
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

/* ============================================================
     Register route (incl. Stripe)
  ============================================================ */
router.post('/register', (req, res) => {
  // Check if email was provided
  if (!req.body.email) {
    res.json({
      success: false,
      message: 'You must provide an e-mail'
    }); // Return error
  } else {
    // Check if username was provided
    if (!req.body.username) {
      res.json({
        success: false,
        message: 'You must provide a username'
      }); // Return error
    } else {
      // Check if password was provided
      if (!req.body.password) {
        res.json({
          success: false,
          message: 'You must provide a password'
        }); // Return error
      } else {
        // Check if firstName was provided
        if (!req.body.firstName) {
          res.json({
            success: false,
            message: 'vorname fehlt'
          }); // Return error
        } else {
          // Check if lastName was provided
          if (!req.body.lastName) {
            res.json({
              success: false,
              message: 'nachname fehlt'
            }); // Return error
          } else {
            // Check if lastName was provided
            if (!req.body.street) {
              res.json({
                success: false,
                message: 'anschrift fehlt'
              }); // Return error
            } else {
              // Check if lastName was provided
              if (!req.body.city) {
                res.json({
                  success: false,
                  message: 'stadt fehlt'
                });
              } else {
                // Check if lastName was provided
                if (!req.body.postcode) {
                  res.json({
                    success: false,
                    message: 'bitte plz angeben'
                  });
                } else {
                  // Check if birthdate was provided
                  if (!req.body.birthdate) {
                    res.json({
                      success: false,
                      message: 'bitte stadt angeben'
                    });
                  } else {
                    // Check if birthdate was provided
                    if (!req.body.phone) {
                      res.json({
                        success: false,
                        message: 'bitte delefon-handy-nr angeben'
                      });
                    } else {
                      async function stripeCustomerCreation() {
                        const response = await stripe.customers.create({
                          email: req.body.email.toLowerCase()
                        });
                        return response.id;
                      }
                      stripeCustomerCreation().then(stripeId => {
                        console.log(stripeId);
                        let user = new User({
                          email: req.body.email.toLowerCase(),
                          phone: req.body.phone,
                          username: req.body.username.toLowerCase(),
                          password: req.body.password,
                          firstName: req.body.firstName,
                          lastName: req.body.lastName,
                          street: req.body.street,
                          city: req.body.city,
                          postcode: req.body.postcode,
                          birthdate: req.body.birthdate,
                          stripeId: stripeId
                        });
                        slack.alert({
                          text: 'Neue Registrierung bei KungFu-Cafelounge',
                          fields: {
                            'E-Mail': req.body.email.toLowerCase(),
                            'Benutzername': req.body.username.toLowerCase(),
                            'Vorname': req.body.firstName,
                            'Stripe ID': stripeId
                          }
                        });
                        // Save user to database
                        user.save(err => {
                          // Check if error occured
                          if (err) {
                            // Check if error is an error indicating duplicate account
                            if (err.code === 11000) {
                              res.json({
                                success: false,
                                message: 'Username or e-mail already exists'
                              }); // Return error
                            } else {
                              // Check if error is a validation rror
                              if (err.errors) {
                                // Check if validation error is in the email field
                                if (err.errors.email) {
                                  res.json({
                                    success: false,
                                    message: err.errors.email.message
                                  }); // Return error
                                } else {
                                  // Check if validation error is in the username field
                                  if (err.errors.username) {
                                    res.json({
                                      success: false,
                                      message: err.errors.username.message
                                    }); // Return error
                                  } else {
                                    // Check if validation error is in the password field
                                    if (err.errors.password) {
                                      res.json({
                                        success: false,
                                        message: err.errors.password.message
                                      }); // Return error
                                    } else {
                                      if (err.errors.firstName) {
                                        res.json({
                                          success: false,
                                          message: err.errors.firstName.message
                                        }); // Return error
                                      } else {
                                        if (err.errors.lastName) {
                                          res.json({
                                            success: false,
                                            message: err.errors.lastName.message
                                          }); // Return error
                                        } else {
                                          if (err.errors.street) {
                                            res.json({
                                              success: false,
                                              message: err.errors.street.message
                                            }); // Return error
                                          } else {
                                            if (err.errors.city) {
                                              res.json({
                                                success: false,
                                                message: err.errors.city.message
                                              }); // Return error
                                            } else {
                                              if (err.errors.postcode) {
                                                res.json({
                                                  success: false,
                                                  message: err.errors.postcode
                                                    .message
                                                }); // Return error
                                              } else {
                                                if (err.errors.birthdate) {
                                                  res.json({
                                                    success: false,
                                                    message: err.errors.birthdate
                                                      .message
                                                  }); // Return error
                                                } else {
                                                  if (err.errors.phone) {
                                                    res.json({
                                                      success: false,
                                                      message: err.errors.phone
                                                        .message
                                                    }); // Return error
                                                  } else {
                                                    res.json({
                                                      success: false,
                                                      message: err
                                                    }); // Return any other error not already covered
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              } else {
                                res.json({
                                  success: false,
                                  message: 'Could not save user. Error: ',
                                  err
                                }); // Return error if not related to validation
                              }
                            }
                          } else {
                            /*
                            let token = new emailConfirmationToken({
                              _userId: user._id,
                              token: crypto.randomBytes(16).toString('hex')
                            });
                            console.log(token);
                            // Save the verification token
                            token.save(function (err) {
                              if (err) {
                                return res.status(500).send({
                                  msg: err.message
                                });
                              }
                              // Send the email
                              let transporter = nodemailer.createTransport({
                                host: process.env.EMAIL_SMTP_HOST,
                                port: 465,
                                secure: true,
                                auth: {
                                  type: 'custom',
                                  user: process.env.EMAIL_SMTP_USERNAME,
                                  pass: process.env.EMAIL_SMTP_PASSWORD,
                                }
                              });
                              if (process.env.NODE_ENV === 'development') {
                                var mailOptions = {
                                  from: process.env.EMAIL_SMTP_NAME,
                                  to: user.email,
                                  subject: 'Dev.: Bitte bestätigen Sie Ihren Account',
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
                                  console.log(err)
                                  console.log(err.message)
                                  return res.status(500).send({
                                    msg: err.message
                                  });
                                }
                                res.status(200).send('Eine Bestätigungs-Mail wurde an ' + user.email + ' gesendet.');
                              });
                            });
                            */
                            res.json({
                              success: true,
                              message: 'Account erfolgreich angelegt. Sie können sich nun einloggen.'
                            }); // Return success
                          }
                        });
                      });
                      // Create new user object and apply user input
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

/* ============================================================
     Route to check if user's email is available for registration
  ============================================================ */
router.get('/checkEmail/:email', (req, res) => {
  // Check if email was provided in paramaters
  if (!req.params.email) {
    res.json({
      success: false,
      message: 'Es wurde keine E-Mail angegeben.'
    }); // Return error
  } else {
    // Search for user's e-mail in database;
    User.findOne({
        email: req.params.email
      },
      (err, user) => {
        if (err) {
          res.json({
            success: false,
            message: err
          }); // Return connection error
        } else {
          // Check if user's e-mail is taken
          if (user) {
            res.json({
              success: false,
              message: 'E-Mail Adresse wird bereits verwendet.'
            }); // Return as taken e-mail
          } else {
            res.json({
              success: true,
              message: 'E-Mail Adresse verfügbar.'
            }); // Return as available e-mail
          }
        }
      }
    );
  }
});

/* ============================================================
     Route to check if user's phone is available for registration
  ============================================================ */
router.get('/checkPhone/:phone', (req, res) => {
  // Check if phone was provided in paramaters
  if (!req.params.phone) {
    res.json({
      success: false,
      message: 'Es wurde keine Telefon-Nr. angegeben.'
    }); // Return error
  } else {
    // Search for user's phone nr in database;
    User.findOne({
        phone: req.params.phone
      },
      (err, user) => {
        if (err) {
          res.json({
            success: false,
            message: err
          }); // Return connection error
        } else {
          // Check if user's phone nr is taken
          if (user) {
            res.json({
              success: false,
              message: 'Telefon-Nr. wird bereits verwendet.'
            }); // Return as taken phone nr
          } else {
            res.json({
              success: true,
              message: 'Telefon-Nr. verfügbar.'
            }); // Return as available phone nr
          }
        }
      }
    );
  }
});

/* ===============================================================
   Route to check if user's username is available for registration
=============================================================== */
router.get('/checkUsername/:username', (req, res) => {
  // Check if username was provided in paramaters
  if (!req.params.username) {
    res.json({
      success: false,
      message: 'Es wurde kein Benutzername angegeben.'
    }); // Return error
  } else {
    // Look for username in database
    User.findOne({
        username: req.params.username
      },
      (err, user) => {
        // Check if connection error was found
        if (err) {
          res.json({
            success: false,
            message: err
          }); // Return connection error
        } else {
          // Check if user's username was found
          if (user) {
            res.json({
              success: false,
              message: 'Benutzername wird bereits verwendet.'
            }); // Return as taken username
          } else {
            res.json({
              success: true,
              message: 'Benutzername verfügbar.'
            }); // Return as available username
          }
        }
      }
    );
  }
});

/* ============================================================
   Login route
============================================================ */
router.post('/login', (req, res) => {
  // Check if username was provided
  if (!req.body.username) {
    res.json({
      success: false,
      message: 'Es wurde kein Benutzername angegeben.'
    }); // Return error
  } else {
    // Check if password was provided
    if (!req.body.password) {
      res.json({
        success: false,
        message: 'Es wurde kein Passwort angegeben.'
      }); // Return error
    } else {
      // Check if username exists in database
      User.findOne({
          username: req.body.username.toLowerCase()
        },
        (err, user) => {
          // Check if error was found
          if (err) {
            res.json({
              success: false,
              message: err
            }); // Return error
          } else {
            // Check if username was found
            if (!user) {
              res.json({
                success: false,
                message: 'Benutzername nicht gefunde.'
              }); // Return error
            } else {
              const validPassword = user.comparePassword(req.body.password); // Compare password provided to password in database
              // Check if password is a match
              if (!validPassword) {
                res.json({
                  success: false,
                  message: 'Das Passwort ist falsch.'
                }); // Return error
              } else {
                const token = jwt.sign({
                    userId: user._id
                  },
                  config.secret, {
                    expiresIn: '24h'
                  }
                ); // Create a token for client
                res.json({
                  success: true,
                  message: 'Sie werden eingeloggt...',
                  token: token,
                  username: user.username
                });
                slack.alert({
                  text: 'Neuer Login bei myHEALFORM',
                  fields: {
                    Benutzername: user.username
                  }
                }),
                  err => {
                    // Check if error
                    if (err) {
                      console.log(err);
                    }
                  };
              }
            }
          }
        }
      );
    }
  }
});

/* ================================================
MIDDLEWARE - Used to grab user's token from headers
================================================ */
router.use((req, res, next) => {
  const token = req.headers['authorization']; // Create token found in headers
  // Check if token was found in headers
  if (!token) {
    res.json({
      success: false,
      message: 'Es konnte kein Authentifizierungs-Token gefunden werden.'
    }); // Return error
  } else {
    // Verify the token is valid
    jwt.verify(token, config.secret, (err, decoded) => {
      // Check if error is expired or invalid
      if (err) {
        res.json({
          success: false,
          message: 'Dieser Token ist ungültig: ' + err
        }); // Return error for token validation
      } else {
        req.decoded = decoded; // Create global variable to use in any request beyond
        next(); // Exit middleware
      }
    });
  }
});

/* ===============================================================
   Route to get user's profile data
=============================================================== */
router.get('/profile', (req, res) => {
  // Search for user in database
  User.findOne({
    _id: req.decoded.userId
  })
    .select('username email phone firstName lastName street city postcode birthdate stripeId isEmailVerified isPhoneVerified')
    .exec((err, user) => {
      // Check if error connecting
      if (err) {
        res.json({
          success: false,
          message: err
        }); // Return error
      } else {
        // Check if user was found in database
        if (!user) {
          res.json({
            success: false,
            message: 'Nutzer nicht gefunden.'
          }); // Return error, user was not found in db
        } else {
          res.json({
            success: true,
            user: user
          }); // Return success, send user object to frontend for profile
        }
      }
    });
});

/* ===============================================================
   Route to get user's public profile data
=============================================================== */
router.get('/publicProfile/:username', (req, res) => {
  // Check if username was passed in the parameters
  if (!req.params.username) {
    res.json({
      success: false,
      message: 'Es wurde kein Benutzername angegeben.'
    }); // Return error message
  } else {
    // Check the database for username
    User.findOne({
      username: req.params.username
    })
      .select('username email')
      .exec((err, user) => {
        // Check if error was found
        if (err) {
          res.json({
            success: false,
            message: 'Es ist ein Fehler aufgetreten.'
          }); // Return error message
        } else {
          // Check if user was found in the database
          if (!user) {
            res.json({
              success: false,
              message: 'Nutzer nicht gefunden.'
            }); // Return error message
          } else {
            res.json({
              success: true,
              user: user
            }); // Return the public user's profile data
          }
        }
      });
  }
});

module.exports = router;

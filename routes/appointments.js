const User = require('../models/User'); // Import User Model Schema
const Charge = require('../models/Charge'); // Import Charge Model Schema
const stripe = require('stripe')(process.env.stripeApiKey);
const fetch = require('node-fetch');
const acuity = process.env.acuityUri;
var cache = require('memory-cache');
var morgan = require('morgan');
var moment = require('moment');
var _ = require('lodash');
const paypal = require('@paypal/checkout-server-sdk');
// const payPalClient = require('../Common/payPalClient');

/* ===============================================================
      New caching instance
  =============================================================== */
let memCache = new cache.Cache();
let cacheMiddleware = duration => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cacheContent = memCache.get(key);
    if (cacheContent) {
      res.send(cacheContent);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = body => {
        memCache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};

module.exports = (router) => {

  router.use(morgan('tiny'));

  /* ===============================================================
      Route: Clear cache
  =============================================================== */
  router.get('/cache/clear', (req, res) => {
    memCache.clear();
    res.json({
      success: true,
      message: 'Cache cleared.'
    }); // Return error message
  });

  /* ===============================================================
      Route: Get all Appointments by User
  =============================================================== */
  router.get('/user/:email/appointments', cacheMiddleware(5000), (req, res) => {
    var email = req.params.email;
    const url = acuity + '/appointments?email=' + email;
    // Search database for all blog posts
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      })
      .catch(error => {
        throw error;
      });
  });

  /* ===============================================================
      Route: Get the next Appointments by User
  =============================================================== */
  router.get('/user/:email/appointments/next', cacheMiddleware(5000), (req, res) => {
    var email = req.params.email;
    const url = acuity + '/appointments?email=' + email;
    // Search database for all blog posts
    fetch(url)
      .then(response => response.json())
      .then(json => {
        var nextAppointments = json.filter(x => Date.parse(x.datetime) > new Date());
        var nextAppointments = _.sortBy(nextAppointments, function (o) {
          return new moment(o.datetime)
        })
        res.json(nextAppointments[0]);
      })
      .catch(error => {
        throw error;
      });
  });

  /* ===============================================================
      Route: Get all previous Appointments by User
  =============================================================== */
  router.get('/user/:email/appointments/future', cacheMiddleware(1000), (req, res) => {
    var email = req.params.email;
    const url = acuity + '/appointments?email=' + email;
    // Search database for all blog posts
    fetch(url)
      .then(response => response.json())
      .then(json => {
        var futureAppointments = json.filter(x => Date.parse(x.datetime) > new Date());
        var futureAppointments = _.sortBy(futureAppointments, function (o) {
          return new moment(o.datetime)
        })
        res.json(futureAppointments);
      })
      .catch(error => {
        throw error;
      });
  });

  /* ===============================================================
      Route: Get all previous Appointments by User
  =============================================================== */
  router.get('/user/:email/appointments/previous', cacheMiddleware(100000), (req, res) => {
    var email = req.params.email;
    const url = acuity + '/appointments?email=' + email;
    // Search database for all blog posts
    fetch(url)
      .then(response => response.json())
      .then(json => {
        var pastAppointments = json.filter(x => Date.parse(x.datetime) < new Date());
        var pastAppointments = _.sortBy(pastAppointments, function (o) {
          return new moment(o.datetime)
        }).reverse();
        res.json(pastAppointments);
      })
      .catch(error => {
        throw error;
      });
  });

  /* ===============================================================
      Route: Get all Certificates by User
  =============================================================== */
  router.get('/user/:email/certificates', cacheMiddleware(10000), (req, res) => {
    var email = req.params.email;
    const url = acuity + '/certificates?email=' + email;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      })
      .catch(error => {
        throw error;
      });
  });

  /* ===============================================================
      Route: Get Certificates for a given appointmentID by User
  =============================================================== */
  router.get('/user/:email/certificates/:appointmentTypeID', cacheMiddleware(10000), (req, res) => {
    var email = req.params.email;
    var appointmentTypeID = req.params.appointmentTypeID;
    const url = acuity + '/certificates?email=' + email + '&appointmentTypeID=' + appointmentTypeID;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      })
      .catch(error => {
        throw error;
      });
  });

  /* ===============================================================
      HTTP: check for user certificates for scheduling
  =============================================================== */
  router.get('/user/:email/certificates/:certificate/check/:appointmentTypeID', (req, res) => {
    var email = req.params.email;
    var certificate = req.params.certificate;
    var appointmentTypeID = req.params.appointmentTypeID;
    const url = acuity +
      '/certificates/check?certificate=' +
      certificate +
      '&appointmentTypeID=' +
      appointmentTypeID +
      '?email=' +
      email;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        if (json.status_code === 400) {
          res.json({
            "success": false
          })
        } else {
          res.json({
            "success": true
          })
        }
      });
  });

  /* ===============================================================
      Route: Get HEALFORM Locations
  =============================================================== */
  router.get('/locations', cacheMiddleware(10000), (req, res) => {
    const url = acuity + '/calendars';
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      });
  });

  /* ===============================================================
      Route: Get Appointment Types
  =============================================================== */
  router.get('/appointment-types', cacheMiddleware(10000), (req, res) => {
    const url = acuity + '/appointment-types';
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      });
  });

  /* ===============================================================
      Route: Get Appointment it's availability dates
  =============================================================== */
  router.get('/availability/dates/:id/:month/:locationId', (req, res) => {
    var id = req.params.id;
    var month = req.params.month;
    var locationId = req.params.locationId;
    const url =
      acuity +
      '/availability/dates?appointmentTypeID=' +
      id +
      '&month=' +
      month +
      '&calendarID=' +
      locationId;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      });
  });

  /* ===============================================================
      Route: Get Appointment it's availability times
  =============================================================== */
  router.get('/availability/times/:id/:date/:locationId', (req, res) => {
    var id = req.params.id;
    var date = req.params.date;
    var locationId = req.params.locationId;
    const url =
      acuity +
      '/availability/times?appointmentTypeID=' +
      id +
      '&date=' +
      date +
      '&calendarID=' +
      locationId;
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      });
  });

  /* ===============================================================
      Route: Get all available Healform products
  =============================================================== */
  router.get('/products', cacheMiddleware(10000), (req, res) => {
    const url = acuity + '/products';
    fetch(url)
      .then(response => response.json())
      .then(json => {
        res.json(json);
      });
  });

  /* ===============================================================
      Route: Get all Appointments
  =============================================================== */
  // TODO: Necessary?
  // router.get('/appointments', (req, res) => {
  //   const url = acuity + '/appointments';
  //   fetch(url)
  //     .then(response => response.json())
  //     .then(json => {
  //       res.json(json);
  //     });
  // });

  /* ===============================================================
      Route: Get Appointment-Details by ID
  =============================================================== */
  router.get('/appointments/:id', cacheMiddleware(10000), (req, res) => {
    if (!req.params.id) {
      res.json({
        success: false,
        message: 'No appointment ID was provided.'
      }); // Return error message
    } else {
      User.findOne({
        _id: req.decoded.userId
      }, (err, user) => {
        // Check if error was found
        if (err) {
          res.json({
            success: false,
            message: err
          }); // Return error message
        } else {
          // Check if user was found in the database
          if (!user) {
            res.json({
              success: false,
              message: 'Unable to authenticate user.'
            }); // Return error message
          } else {
            const id = req.params.id;
            const url = acuity + '/appointments/' + id;
            fetch(url)
              .then(response => response.json())
              .then(json => {
                if (json.email === user.email) {
                  res.json(json);
                } else {
                  res.json({
                    success: false,
                    message: 'You are not authorized to edit this apoointment.'
                  });
                }
              });
          }
        }
      })
    }
  });

  /* ===============================================================
      Route: Cancel Appointment by ID
  =============================================================== */
  router.put('/appointments/:id/cancel', (req, res) => {
    const appointmentId = req.params.id;
    if (!appointmentId) {
      res.json({
        success: false,
        message: 'No appointment ID was provided.'
      }); // Return error message
    } else {
      User.findOne({
        _id: req.decoded.userId
      }, (err, user) => {
        // Check if error was found
        if (err) {
          res.json({
            success: false,
            message: err
          }); // Return error message
        } else {
          // Check if user was found in the database
          if (!user) {
            res.json({
              success: false,
              message: 'Unable to authenticate user.'
            }); // Return error message
          } else {
            const url = acuity + '/appointments/' + appointmentId;
            fetch(url)
              .then(response => response.json())
              .then(json => {
                if (json.email === user.email) {
                  const cancelUrl = acuity + '/appointments/' + appointmentId + '/cancel';
                  fetch(cancelUrl, {
                    mode: 'no-cors',
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Requested-With': 'content-type'
                    },
                  })
                    .then(res => res.json())
                    .then(json => {
                      if (json.id) {
                        Charge.findOne({
                          appointmentId: json.id
                        }, (err, charge) => {
                          // Check if error was found
                          if (err) {
                            res.json({
                              success: false,
                              message: err
                            }); // Return error message
                          } else {
                            // Check if user was found in the database
                            if (!charge) {
                              // TODO: Bug: Fehlermeldung wenn 'charge' in Datenbank nicht gefunden wurde
                              res.json({
                                success: false,
                                message: 'Unable to authenticate user.'
                              }); // Return error message
                            } else {
                              if (charge.paymentMethod === 'stripe') {
                                stripe.refunds.create({
                                  charge: charge.chargeId,
                                }).then(refund => {
                                  charge.isRefunded = true;
                                  charge.update({
                                      $set: {
                                        isRefunded: true
                                      }
                                    },
                                    function (err) {
                                      if (err) {
                                        console.log(err);
                                        return handleError(err);
                                      }
                                    });
                                  memCache.clear();
                                  res.json({
                                    success: true,
                                    message: 'Termin erfolgreich storniert. Der Betrag wurde Ihnen erstattet.'
                                  });
                                })
                                  .catch(err => {
                                    console.log("Error:", err);
                                    res.json({
                                      success: false,
                                      message: 'Es ist ein Problem beim Autorisieren der Zahlung aufgetreten.',
                                      error: 'Error: ' + err
                                    })
                                  });
                              } else {
                                if (charge.paymentMethod === 'certificate') {
                                  res.json({
                                    success: true,
                                    message: 'Termin erfolgreich storniert. Der Termin wurde Ihrem Zertifikat erstattet.'
                                  });
                                } else {
                                  if (charge.paymentMethod === 'paypal') {
                                    // TODO: paypal refund
                                    console.log('not embedded yet')
                                  }
                                }
                              }
                            }
                          }
                        })
                      } else {
                        res.json({
                          success: false,
                          message: 'Beim Stornieren des Termin ist ein unbekannter Fehler aufgetreten.'
                        })
                      }
                    })
                    .catch(err => {
                      res.json({
                        success: false,
                        message: 'Beim Stornieren des Termin ist ein unbekannter Fehler aufgetreten.',
                        error: 'Error:' + err
                      })
                    });
                } else {
                  res.json({
                    success: false,
                    message: 'Sie haben keine Rechte diesen Termin zu verwalten.'
                  });
                }
              });
          }
        }
      })
    }
  });

  /* ===============================================================
     Route: Schedule new appointment
  =============================================================== */
  router.post('/appointment/schedule', (req, res) => {
    if (!req.body.appointment.appointmentTypeID) {
      res.json({
        success: false,
        message: 'You must provide an appointmentTypeID'
      });
    } else {
      if (!req.body.appointment.calendarID) {
        res.json({
          success: false,
          message: 'You must provide a calendarID'
        }); // Return error
      } else {
        if (!req.body.appointment.datetime) {
          res.json({
            success: false,
            message: 'You must provide date'
          }); // Return error
        } else {
          // Check if username was provided
          if (!req.body.appointment.firstName) {
            res.json({
              success: false,
              message: 'You must provide a firstname'
            }); // Return error
          } else {
            // Check if username was provided
            if (!req.body.appointment.lastName) {
              res.json({
                success: false,
                message: 'You must provide a lastName'
              }); // Return error
            } else {
              if (!req.body.appointment.phone) {
                res.json({
                  success: false,
                  message: 'You must provide a phone nr'
                })
              } else {
                // Check if username was provided
                if (!req.body.appointment.fields) {
                  res.json({
                    success: false,
                    message: 'You must provide the form fields'
                  }); // Return error
                } else {
                  // Check if username was provided
                  if (!req.body.charge.paymentMethod) {
                    res.json({
                      success: false,
                      message: 'You must provide a payment method'
                    }); // Return error
                  } else {
                    if (req.body.charge.paymentMethod === 'stripe') {
                      if (!req.body.charge.stripeId) {
                        res.json({
                          success: false,
                          message: 'You must provide a stripeId'
                        }); // Return error
                      } else {
                        if (!req.body.charge.stripeToken) {
                          res.json({
                            success: false,
                            message: 'You must provide a stripeToken'
                          });
                        } else {
                          if (!req.body.charge.amount) {
                            res.json({
                              success: false,
                              message: 'no amount provided'
                            });
                          } else {
                            stripe.customers.update(req.body.charge.stripeId, {
                              source: req.body.charge.stripeToken,
                            }).then(customer =>
                              stripe.charges.create({
                                amount: req.body.charge.amount,
                                capture: false,
                                currency: "eur",
                                customer: customer.id,
                                description: req.body.charge.description,
                              }))
                              .then(charge => {
                                if (charge.id) {
                                  const chargeId = charge.id;
                                  console.log(chargeId);
                                  const appointmentObj = {
                                    appointmentTypeID: req.body.appointment.appointmentTypeID,
                                    calendarID: req.body.appointment.calendarID,
                                    datetime: req.body.appointment.datetime,
                                    firstName: req.body.appointment.firstName,
                                    lastName: req.body.appointment.lastName,
                                    email: req.body.appointment.email,
                                    phone: req.body.appointment.phone,
                                    fields: req.body.appointment.fields,
                                    certificate: null,
                                  };
                                  const url = acuity + '/appointments';
                                  fetch(url, {
                                    mode: 'no-cors',
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'X-Requested-With': 'content-type'
                                    },
                                    body: JSON.stringify(appointmentObj), // body data type must match "Content-Type" header
                                  })
                                    .then(res => res.json())
                                    .then(json => {
                                      if (json.id) {
                                        const appointmentId = json.id;
                                        memCache.clear();
                                        console.log(chargeId);
                                        console.log(appointmentId);
                                        stripe.charges.capture(chargeId)
                                          .then(charge => {
                                            User.findOne({
                                              _id: req.decoded.userId
                                            }, (err, user) => {
                                              // Check if error was found
                                              if (err) {
                                                res.json({
                                                  success: false,
                                                  message: err
                                                }); // Return error message
                                              } else {
                                                // Check if user was found in the database
                                                if (!user) {
                                                  res.json({
                                                    success: false,
                                                    message: 'Unable to authenticate user.'
                                                  }); // Return error message
                                                } else {
                                                  const charge = new Charge({
                                                    appointmentId: appointmentId, // Title field
                                                    chargeId: chargeId, // Body field
                                                    user: user.email, // CreatedBy field
                                                    paymentMethod: req.body.charge.paymentMethod
                                                  });
                                                  charge.save((err) => {
                                                    // Check if error
                                                    if (err) {
                                                      res.json({
                                                        success: false,
                                                        message: 'Ein unerwarteter Fehler ist aufgetreten.'
                                                      }) // Return success message
                                                    } else {
                                                      res.json({
                                                        success: true,
                                                        message: 'Termin erfolgreich gebucht.'
                                                      }) // Return success message
                                                    }
                                                  });
                                                }
                                              }
                                            })
                                              .catch(err => {
                                                console.log("Error:", err);
                                                res.json({
                                                  success: false,
                                                  message: 'Es ist ein Problem bei der Belastung der Kreditkarte aufgetreten.',
                                                  error: 'Error: ' + err
                                                })
                                              })
                                          })
                                      } else {
                                        res.json({
                                          success: false,
                                          message: 'Beim Buchen des Termin ist ein unbekannter Fehler aufgetreten.'
                                        })
                                      }
                                    })
                                    .catch(err => {
                                      res.json({
                                        success: false,
                                        message: 'Es ist ein Fehler beim Buchen des Termins aufgetreten.',
                                        error: 'Error:' + err
                                      })
                                    });
                                }
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
                    } else {
                      if (req.body.charge.paymentMethod === 'certificate') {
                        if (!req.body.appointment.certificate && req.body.appointment.certificate === null) {
                          res.json({
                            success: false,
                            message: 'You must provide a certificate to book an appointment with'
                          }); // Return error
                        } else {
                          const appointmentObj = {
                            appointmentTypeID: req.body.appointment.appointmentTypeID,
                            calendarID: req.body.appointment.calendarID,
                            datetime: req.body.appointment.datetime,
                            firstName: req.body.appointment.firstName,
                            lastName: req.body.appointment.lastName,
                            email: req.body.appointment.email,
                            phone: req.body.appointment.phone,
                            fields: req.body.appointment.fields,
                            certificate: req.body.appointment.certificate,
                          };
                          const urlCheck = acuity +
                            '/certificates/check?certificate=' +
                            appointmentObj.certificate +
                            '&appointmentTypeID=' +
                            appointmentObj.appointmentTypeID +
                            '?email=' +
                            appointmentObj.email;
                          fetch(urlCheck)
                            .then(response => response.json())
                            .then(json => {
                              if (json.status_code === 400) {
                                res.json({
                                  success: false,
                                  message: 'das zertifikat funktioniert nicht für diese buchung.'
                                })
                              } else {
                                const urlSchedule = acuity + '/appointments';
                                fetch(urlSchedule, {
                                  mode: 'no-cors',
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'X-Requested-With': 'content-type'
                                  },
                                  body: JSON.stringify(appointmentObj), // body data type must match "Content-Type" header
                                })
                                  .then(res => res.json())
                                  .then(json => {
                                    if (json.id) {
                                      res.json({
                                        success: true,
                                        message: 'Termin erfolgreich gebucht.'
                                      })
                                    } else {
                                      res.json({
                                        success: false,
                                        message: 'Beim Buchen des Termin ist ein unbekannter Fehler aufgetreten.'
                                      })
                                    }
                                  })
                                  .catch(err => {
                                    res.json({
                                      success: false,
                                      message: 'Es ist ein Fehler beim Buchen des Termins aufgetreten.',
                                      error: 'Error:' + err
                                    })
                                  });
                              }
                            });
                        }
                      } else {
                        if (req.body.charge.paymentMethod === 'paypal') {
                          console.log('paypal')
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
    }
  });

  return router;
};

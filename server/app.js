/*global process*/
require('dotenv').config({});
const util = require('util');
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser')
const path = require('path');
// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

console.log('process.env.STRIPE_API_SECRET');
console.log(process.env.STRIPE_API_SECRET);

/*Allow CORS*/
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/checkout', function (req, res, next) {
  // Token is created using Stripe.js or Checkout!
  // Get the payment token submitted by the form:
  var token = req.body.stripeToken; // Using Express

  // Charge the user's card:
  var charge = stripe.charges.create({
    amount: 100,
    currency: "sgd",
    description: "Example charge",
    source: token,
  }, function (err, charge) {
    if (err) {
      return next(err);
    }
    // asynchronously called
    res.json({
      charge
    });
  });

});

// Notes: email: 'tuanquynet+c1@gmail.com' is used for pure-html demo app
// email: 'tuanquynet+c2@gmail.com' is used for react demo app
async function createCustomerWithStripeToken(token) {
  const customer = await stripe.customers.create({
    email: 'tuanquynet+c2@gmail.com',
    source: token,
  });

  return customer;
}

async function createSubscription(customer) {
  const subscription = await stripe.subscriptions.create({
    customer: customer.id, //ex: 'cus_FLZ6bX5f8lszCM',
    items: [{plan: 'monthly-1-5-072019'}],
  }).catch((err) => {
    console.error(err);
    
    throw err;
  });

  return subscription;
}

app.post('/charge', function (req, res, next) {
  console.log(JSON.stringify(req.body));
  // {stripeToken: "tok_1EvSBeEa59WrJ6C8kghAkYf7"}
  // return res.json(req.body);
  // customer info: email: matthew.thompson.32@example.com, id: cus_FLZ6bX5f8lszCM
  createCustomerWithStripeToken(req.body.stripeToken)
    .then((customer) => {
      console.log(JSON.stringify(customer));

      return createSubscription(customer);
    }).then((subscription) => {
      res.json({subscription});
    });
});

// var host = process.env.host;
const port = process.env.PORT || 9010;
const host = process.env.HOST || '0.0.0.0';

app.start = () => {

  app.listen(port, function () {
    console.log('static server client/');
    console.log('Example app listening at http://%s:%s', host, port);
  });
}
app.start();

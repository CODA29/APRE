/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre customer feedback API for the customer feedback reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /channel-rating-by-month
 *
 * Fetches average customer feedback ratings by channel for a specified month.
 *
 * Example:
 * fetch('/channel-rating-by-month?month=1')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/channel-rating-by-month', (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month) {
      return next(createError(400, 'month and channel are required'));
    }

    mongo (async db => {
      const data = await db.collection('customerFeedback').aggregate([
        {
          $addFields: {
            date: { $toDate: '$date' }
          }
        },
        {
          $group: {
            _id: {
              channel: "$channel",
              month: { $month: "$date" },
            },
            ratingAvg: { $avg: '$rating'}
          }
        },
        {
          $match: {
            '_id.month': Number(month)
          }
        },
        {
          $group: {
            _id: '$_id.channel',
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channel: '$_id',
            ratingAvg: 1
          }
        },
        {
          $group: {
            _id: null,
            channels: { $push: '$channel' },
            ratingAvg: { $push: '$ratingAvg' }
          }
        },
        {
          $project: {
            _id: 0,
            channels: 1,
            ratingAvg: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);

  } catch (err) {
    console.error('Error in /rating-by-date-range-and-channel', err);
    next(err);
  }
});



/**
 *@description
  * GET/ customer-feedback-by-customer
  *
  * Fetches customer feedback entries for a specified customer.
  *
  * Example:
  * fetch('/customer-feedback-by-customer?customerName=JohnDoe')
  *  .then(response => response.json())
  *  .then(data => console.log(data));
 */

 
 // router to get all customer names from the customerFeedback collection
 router.get('/customer-names', async (req, res, next) => {
   try {
     await mongo(async db => {
       // Get all distinct region names from the collection
       const customers = await db.collection('customerFeedback').distinct('customer');
       res.status(200).json(customers);
       console.log('Regions:', customers);
     });
   } catch (err) {
     res.status(500).json({ message: 'Internal server error.'});
     next(err);
   }
 });



// Route to get customer feedback by customer name
 router.get('/customer-feedback-by-customer/:customer', async (req, res) => {
  const customerName = req.params.customer;

  // Validate the customer name parameter
  if (!customerName || customerName.trim() === "") {
    return res.status(400).json({ message: 'customer name is required.' });
  }

  // Query the database for product and feedback entries matching the customer name
  try {
    await mongo(async db => {
      const data = await db.collection('customerFeedback').aggregate([
        { $match: { customer: customerName } },
        {
          $group: {
            _id: "$customer",
            products: { $addToSet: "$product" },
            feedbacks: { $addToSet: "$feedbackText" }
          }
        },
        {
          $project: {
            _id: 0,
            customerName: "$_id",
            products: 1,
            feedbacks: 1
          }
        }
      ]).toArray();

      // If no data found for the customer, return 404
      if (!data || data.length === 0) {
        return res.status(404).json({ message: 'Customer does not exist.' });
      }

      // Return the aggregated data
      return res.status(200).json(data);
    });
  } catch (err) {
    console.error(err);

    // Handle unexpected errors
    return res.status(500).json({ message: 'Internal server error.' });
  }
});



module.exports = router;
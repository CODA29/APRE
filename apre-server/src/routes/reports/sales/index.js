/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre sales report API for the sales reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');

const router = express.Router();

/**
 * @description
 *
 * GET /regions
 *
 * Fetches a list of distinct sales regions.
 *
 * Example:
 * fetch('/regions')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions', (req, res, next) => {
  try {
    mongo (async db => {
      const regions = await db.collection('sales').distinct('region');
      res.send(regions);
    }, next);
  } catch (err) {
    console.error('Error getting regions: ', err);
    next(err);
  }
});

/**
 * @description
 *
 * GET /regions/:region
 *
 * Fetches sales data for a specific region, grouped by salesperson.
 *
 * Example:
 * fetch('/regions/north')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/regions/:region', (req, res, next) => {
  try {
    mongo (async db => {
      const salesReportByRegion = await db.collection('sales').aggregate([
        { $match: { region: req.params.region } },
        {
          $group: {
            _id: '$salesperson',
            totalSales: { $sum: '$amount'}
          }
        },
        {
          $project: {
            _id: 0,
            salesperson: '$_id',
            totalSales: 1
          }
        },
        {
          $sort: { salesperson: 1 }
        }
      ]).toArray();
      res.send(salesReportByRegion);
    }, next);
  } catch (err) {
    console.error('Error getting sales data for region: ', err);
    next(err);
  }
});




/**
 * @description
 *
 * GET /sales-by-customer/
 *
 * Fetches sales data grouped by customer and product.
 *
 * Example:
 * fetch('/sales-by-customer')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */

router.get('/sales-by-customer', async (req, res, next) => {

  try{
    await mongo( async db => {
      // Aggregate sales data grouped by customer and product
      const salesByCustomer = await db.collection('sales').aggregate([
        {
          // Group by customer and product
          $group: {
            _id: {
              customer: "$customer",
              product: "$product"
            },
            amount: {
              $sum: "$amount"
            }
          }

        },
        {
          // Project the desired fields
          $project: {
            _id: 0,
            customer: "$_id.customer",
            product: "$_id.product",
            amount: 1
          }
        }

      ]).toArray();

      // Respond with JSON, even if empty array
      res.status(200).json(salesByCustomer);
      console.log('Sales by customer: ', salesByCustomer);

    }, next)
  }catch(err){
    console.error('err ', err);
    next(err);
  }

});


module.exports = router;
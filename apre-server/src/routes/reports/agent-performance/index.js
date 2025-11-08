/**
 * Author: Professor Krasso
 * Date: 8/14/24
 * File: index.js
 * Description: Apre agent performance API for the agent performance reports
 */

'use strict';

const express = require('express');
const { mongo } = require('../../../utils/mongo');
const createError = require('http-errors');

const router = express.Router();

/**
 * @description
 *
 * GET /call-duration-by-date-range
 *
 * Fetches call duration data for agents within a specified date range.
 *
 * Example:
 * fetch('/call-duration-by-date-range?startDate=2023-01-01&endDate=2023-01-31')
 *  .then(response => response.json())
 *  .then(data => console.log(data));
 */
router.get('/call-duration-by-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(createError(400, 'Start date and end date are required'));
    }

    console.log('Fetching call duration report for date range:', startDate, endDate);

    mongo(async db => {
      const data = await db.collection('agentPerformance').aggregate([
        {
          $match: {
            date: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $lookup: {
            from: 'agents',
            localField: 'agentId',
            foreignField: 'agentId',
            as: 'agentDetails'
          }
        },
        {
          $unwind: '$agentDetails'
        },
        {
          $group: {
            _id: '$agentDetails.name',
            totalCallDuration: { $sum: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agent: '$_id',
            callDuration: '$totalCallDuration'
          }
        },
        {
          $group: {
            _id: null,
            agents: { $push: '$agent' },
            callDurations: { $push: '$callDuration' }
          }
        },
        {
          $project: {
            _id: 0,
            agents: 1,
            callDurations: 1
          }
        }
      ]).toArray();

      res.send(data);
    }, next);
  } catch (err) {
    console.error('Error in /call-duration-by-date-range', err);
    next(err);
  }
});


/**
  Routes for agent performance by region

  * @description:
  * 1. GET /regions - Get all unique region names from the agentPerformance collection
  * 2. GET /regions/:region - Get performance metrics for a specific region
  *
  * Example:
  * fetch('/regions')
  *  .then(response => response.json())
  *  .then(data => console.log(data));
  *
  * fetch('/regions/Asia')
  *  .then(response => response.json())
  *  .then(data => console.log(data));
  *
*/


// Route to get all unique region names
router.get('/regions', async (req, res, next) => {
  try {
    await mongo(async db => {
      // Get all distinct region names from the collection
      const regions = await db.collection('agentPerformance').distinct('region');
      res.status(200).json(regions);
      console.log('Regions:', regions);
    });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error'});
    next(err);
  }
});

// Route to get data for the selected region
router.get('/regions/:region', async (req, res, next) => {
  try{
    const region = req.params.region;

    await mongo(async db => {
      // Find all documents with the same region
      const data = await db.collection('agentPerformance').find(
        {
          region: region
        },
        {
          projection: {
            _id: 0,
            performanceMetrics: 1
          }
        }
      ).toArray();

      if(data.length === 0){
        return res.status(404).json({ message: 'No records found for this region.' });
      }

      // An array to hold all performanceMetrics
      let allMetrics = []

      // Loop through all documents in the collection and collect their performanceMetrics
      for(let x=0; x < data.length; x++){
        const metrics = data[x].performanceMetrics;
        for (let i=0; i < metrics.length; i++ ){
          allMetrics.push(metrics[i]);
        }
      }

      // Combine metrics by type i.e., Customer Satisfaction and Sales Conversion
      let summary = {};

      // Loop through the performanceMetrics array and sum values by metricType
      for(let i=0; i < allMetrics.length; i++){
        const metric = allMetrics[i];
        const type = metric.metricType;
        const value = metric.value;

        // sum the performanceMetrics values for each metricType
        if(summary[type]){
          summary[type] += value;
        }else{
          summary[type] = value;
        }
      }


      // Turn the summary object into an array
      let result = [];
      for (let type in summary){
        result.push({metricType: type, value: summary[type]});
      }

      // Send the result back to the client
      res.status(200).json(result);
      console.log('Performance metrics for region: ', region, result);

    });

  }catch(err){
    res.status(404).json({ message: 'Region does not exist.' });
    next(err);
  }
})



module.exports = router;
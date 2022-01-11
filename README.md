Shopify Backend Developer Challenge

Submission by Atharva Gangal

A simple, clean CRUD application to store inventory (products).

The main landing page includes a list of products, their ids, and their total quantities. This data is representative of larger databases with more fields. The extra feature is enabling restore and deletion comments.

When the expand button is pressed, more details are shown, specifically the location, quantity and status of that inventory. Records can be updated or deleted.

This application is written using MongoDB Atlas and Express + Node. Light styling was done using Bootstrap. MongoDB (NoSQL) was chosen for its ease of horizontal expansion (for fields like quantity description). Express was chosen for fast development times.

To use the application, please go to this link:

To run it locally, clone the application. Run npm install to install all dependencies. You will need to create a .env file with your own credentials for MongoDB Atlas. When finished, run node app.js and open localhost:3000 in your browser.
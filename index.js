require('dotenv').load();
const {MongoClient} = require('mongodb');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 6001;

// Connect to mongo db
let dbo;

MongoClient.connect(process.env.MONGO_URI, (err, client) => {
  if (err) throw err;
  console.log('db ready');
  dbo = client.db('map-tut');
});

// Allow cors
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('success');
});

app.post('/get-markers', (req, res) => {
  const {southWest, northEast} = req.body.bounds;

  // Check to make sure that the frontend is sending coords
  if (!southWest || !northEast) {
    return res.status(500).send('no coordinates provided');
  }

  const collection = dbo.collection('locations');
  const objs = collection
    .find({
      geo: {
        $geoWithin: {
          $box: [
            [southWest.lng, southWest.lat],
            [northEast.lng, northEast.lat],
          ],
        },
      },
    })
    .toArray((err, result) => {
      if (err) {
        return res.json({error: 'could not get locations'});
      }
      res.json(result);
    });
});

app.listen(port, () => {
  console.log('app listening on port ', port);
});

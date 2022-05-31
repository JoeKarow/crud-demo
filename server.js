const express = require('express');
const bodyParser = require('body-parser');
const mongoDB = require('mongodb');
require('dotenv').config();
const MongoClient = mongoDB.MongoClient;
const app = express();

// set EJS
app.set('view engine', 'ejs');

// middleware
app.use(express.static('public'));

//enable body-parser & json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//connect to mongoDB
MongoClient.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URI}`,
  { useUnifiedTopology: true }
)
  .catch((err) => console.error(err))
  .then((client) => {
    console.info('Connected to mongoDB');
    const db = client.db('crud-demo');
    const quotesCollection = db.collection('quotes');

    // index
    app.get('/', (req, res) => {
      // get all records
      const cursor = db
        .collection('quotes')
        .find()
        .toArray()
        .then((results) => {
          res.render('index.ejs', { quotes: results });
        })
        .catch((err) => console.error(err));
    });

    // add record
    app.post('/quotes', (req, res) => {
      quotesCollection
        .insertOne(req.body)
        .then(res.redirect('/'))
        .then((res) => console.info(res))
        .catch((err) => console.error(err));
    });

    // update
    app.put('/quotes', async (req, res) => {
      // const cursor = await quotesCollection.aggregate([
      //   { $sample: { size: 1 } },
      // ]);
      const cursor = await randomRecord(quotesCollection);
      console.dir(cursor);
      await quotesCollection
        .updateOne(
          {
            _id: cursor[0]._id,
          },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => {
          console.log('Update:', result);
          res.json('Success');
        })
        .catch((err) => console.error(err));
    });

    // delete
    app.delete('/quotes', (req, res) => {
      quotesCollection
        .deleteOne({ quote: req.body.quote })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json('No quote to delete');
          }
          res.json(`Deleted quote: ${req.body.quote}`);
        })
        .catch((err) => console.error(err));
    });

    app.listen(process.env.LISTEN_PORT, () =>
      console.info(`Server started on port ${process.env.LISTEN_PORT}`)
    );
  });

const randomRecord = async (conn) =>
  await conn.aggregate([{ $sample: { size: 1 } }]).toArray();

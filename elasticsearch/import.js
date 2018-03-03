// const elasticsearch = require('elasticsearch');
const csv = require('csv-parser');
const fs = require('fs');

const parseVotes = require('./votes-parser'); // Module to handle parsing of calls
const INDEX_NAME = require('./constants').INDEX_NAME; // index name constant
const INDEX_TYPE = require('./constants').INDEX_TYPE; // index type constant



const my_elastic = require('./elastic-api'); // Module to handle elastic workflow

my_elastic.createFreshIndex(INDEX_NAME, INDEX_TYPE, {coordinates: { type: "geo_point" }});



const votes = [];
let i = 0;

// fs.createReadStream('../French_Presidential_Election_2017_First_Round.csv')
fs.createReadStream('../French_Presidential_Election_2017_First_Round.small.csv')
  .pipe(csv())
  .on('data', data => (i++ < 10) ? votes.push(parseVotes(data)) : undefined ) // parser used here
  .on('end', () => {
    console.log(votes[0]);
    // client.bulk(createBulkInsertQuery(votes), (err, res) => {
    //   if (err) console.trace(err.message);
    //   else console.log(`Inserted ${res.items.length} voting results`);
    //   client.close();
    // });
  });

const createBulkInsertQuery = votes => {
  const body = votes.reduce((acc, vote) => {
          acc.push({ index: { _index: INDEX_NAME, _type: INDEX_TYPE} });
          acc.push(vote); // vote is formatted, considering parsing phase
          return acc;
        }, []);

  return { body };
};
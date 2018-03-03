// const elasticsearch = require('elasticsearch');
const csv = require('csv-parser');
const fs = require('fs');

const parseVotes = require('./votes-parser'); // Module to handle parsing of calls
const INDEX_NAME = require('./constants').INDEX_NAME; // index name constant
const INDEX_TYPE = require('./constants').INDEX_TYPE; // index type constant



const my_elastic = require('./elastic-api')(INDEX_NAME, INDEX_TYPE); // Module to handle elastic workflow

my_elastic.createFreshIndex({
  coordinates: { type: "geo_point" }
});



const votes = [];
let i = 0;

// fs.createReadStream('../French_Presidential_Election_2017_First_Round.csv')
fs.createReadStream('../French_Presidential_Election_2017_First_Round.small.csv')
  .pipe(csv())
  .on('data', data => (i++ < 10) ? votes.push(parseVotes(data)) : undefined ) // parser used here
  .on('end', () => {
    console.log(votes[0]);
    my_elastic.insert(votes)
      .then(res => console.log(`Inserted ${res.items.length} voting results`))
      .catch(err => console.trace(err));
  });
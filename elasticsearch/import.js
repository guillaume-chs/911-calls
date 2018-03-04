// npm modules
const csv = require('csv-parser');
const fs = require('fs');


// my modules
const my_parser = require('./votes-parser'); // Module to handle the parsing of vote results
const my_constants = require('./constants'); // Module to keep the shared global constants
const my_lazy_elastic = require('./elastic-api'); // Module to handle the elastic workflow


// initialization
const votes = []; // votes accumulator
const indexName = my_constants.INDEX_NAME; // index name constant
const indexType = my_constants.INDEX_TYPE; // index type constant
const mappings = my_parser.mappings; // Mappings of vote index

const catchAndTrace = err => { console.trace(err) }; // catch helper function

const my_elastic = my_lazy_elastic(indexName, indexType, mappings); // This is where my_elastic module gets init


// import workflow
my_elastic.createFreshIndex()
  .catch(catchAndTrace)
  .then(res => {
    // fs.createReadStream('../French_Presidential_Election_2017_First_Round.csv')
    fs.createReadStream('../French_Presidential_Election_2017_First_Round.small.csv')
      .pipe(csv())
      .on('data', data => votes.push(my_parser.parseVotes(data)) ) // parser used here
      .on('end', () => {
        my_elastic.insert(votes)
          .then(res => console.log(`Inserted ${res.items.length} voting results`))
          .catch(catchAndTrace);
      });
  });



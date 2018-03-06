// npm modules
const csv = require('csv-parser');
const fs = require('fs');


// my modules
const my_constants = require('../constants'); // Module to keep the shared global constants
const my_parser = require('../votes-parser')(my_constants.CONTEXTS.ELASTIC); // Module to handle the parsing of vote results
const my_lazy_elastic = require('./elastic-api'); // Module to handle the elastic workflow


// initialization
const votes = []; // votes accumulator
const indexName = my_constants.INDEX_NAME; // index name constant
const indexType = my_constants.INDEX_TYPE; // index type constant
const dataFolder = '../' + my_constants.DATA_FOLDER + '/'; // data folder relative path
const mappings = my_parser.mappings; // Mappings of vote index

const my_elastic = my_lazy_elastic(indexName, indexType, mappings); // This is where my_elastic module gets init


// prepare the data
const testFile = dataFolder + 'French_Presidential_Election_2017_First_Round.sample.csv'; // 10 first lines
const originalFile = dataFolder + 'French_Presidential_Election_2017_First_Round.csv';

const fragments = Array
  .of(1,2,3,4,5)
  .map(i => `${dataFolder}French_Presidential_Election_2017_First_Round.part${i}.csv`);

console.log('The file is big, we need to chop it down');
console.log(fragments);
console.log('\n');


// import workflow
my_elastic.createFreshIndex()
  .then(res => importFragmentRecursively(0))
  .catch(console.trace);

// recursively import all fragments
const importFragmentRecursively = i => {
  if (i >= fragments.length) return;

  const acc = [];
  const fragment = fragments[i];
  
  fs.createReadStream(fragment)
    .pipe(csv())
    .on('data', chunk => acc.push(my_parser.parseVotes(chunk)) ) // parser used here
    .on('end', () => {
      console.log('---\nInserting ' + fragment);
      my_elastic.insert(acc)
        .then(res => {
          console.log(`${fragment} : inserted ${res} lines`);
          importFragmentRecursively(i+1);
        });
    });
};
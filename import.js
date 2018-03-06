
if (process.argv.length !== 3) {
    console.log('Usage : node import.js [--elastic | --mongo]');
    process.exit(2);
}

const arg = process.argv[2];
if (arg !== '--elastic' && arg !== '--mongo') {
    console.log('Usage : node import.js [--elastic | --mongo]');
    process.exit(3);
}


////////////
// npm modules
////////////
const csv = require('csv-parser');
const fs = require('fs');


////////////
// initialization
////////////
const my_constants = require('./constants'); // Module to keep the shared global constants
const indexName = my_constants.INDEX_NAME; // index name constant
const indexType = my_constants.INDEX_TYPE; // index type constant
const contexts = my_constants.CONTEXTS; // contexts constant
const dataFolder = './' + my_constants.DATA_FOLDER + '/'; // data folder relative path


////////////
// original datafile is too big : 191Mb
// we need to avoid 2 issues
//   - JavaScript heap out of memory
//   - ElasticSearch error "Request Entity is too large"
////////////
const originalFile = dataFolder + 'French_Presidential_Election_2017_First_Round.csv';
const testFile = dataFolder + 'French_Presidential_Election_2017_First_Round.sample.csv'; // 10 first lines
console.log('The file is big, let\'s split it : ');

const fragments = Array
    .of(1,2,3,4,5)
    .map(i => `${dataFolder}French_Presidential_Election_2017_First_Round.part${i}.csv`);

console.log(fragments);
console.log('\n');


////////////
// importing is a generic workflow which just needs to be contextualized
//   - one parser
//   - one driver
////////////
const importWithContext = context => {

    const driver_module = (context === contexts.ELASTIC) ?
        './elasticsearch/elastic-api' : // Module to handle the elastic workflow
        './mongodb/mongo-api';          // Module to handle the mongo workflow
    
    const my_parser = require('./votes-parser')(context); // Module to handle the parsing of vote results
    const my_driver = require(driver_module)(indexName, indexType, my_parser.mappings);

    my_driver.newIndex()
        .then(() => {
            fragments.forEach(chunk => {
                const acc = [];
                fs.createReadStream(chunk)
                    .pipe(csv())
                    .on('data', chunk => acc.push(my_parser.parseVotes(chunk)) ) // parser used here
                    .on('end', () => {
                        my_driver
                            .insert(acc)
                            .then(res => console.log(`---\nFragment "${chunk.substring(53,58)}", lines inserted : ${res}\n---`));
                    });
            })
        })
        .catch(console.trace);
};


////////////
// launcher
////////////
const context = (arg === '--elastic') ? contexts.ELASTIC : contexts.MONGO;
importWithContext(context);
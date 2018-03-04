const elasticsearch = require('elasticsearch');

let indexName;
let indexType;
let mappings;
let client = undefined;

const openClient = () => {
  client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info' // 'error'
  });
  return client;
}

const closeClient = () => {
  client.close();
  console.log('Removing connection');
  client = undefined;
}






const checkIndexExists = indexName => new Promise((resolve, reject) => {
  console.log('Checking index');

  if (!client) reject(new Error('client is undefined'));

  else client.indices.exists({ index: indexName }, (err, res) => {
      if (err) reject(err);
      else     resolve(res);
  });
});



const flushIndex = indexName => new Promise((resolve, reject) => {
  console.log('Flushing index');
  if (!client) reject(new Error('client is undefined'));

  else client.indices.flushSynced({ index: indexName }, (err, res) => {
    if (err) reject(err);
    else     resolve(res);
  });
});



const createIndex = (indexName, indexType, mappings) => new Promise((resolve, reject) => {
  console.log('Creating index');
  if (!client) reject(new Error('client is undefined'));

  else client.indices.create({ index: indexName }, (err, res) => {
    if (err) reject(err);
    
    else if (!mappings) resolve(res);
    else {
      client.indices.putMapping({
        index: indexName,
        type: 'voteresult',
        body: {
          'voteresult': {
            properties: { ...mappings }
          }
        }
      }, (err, res) => (err) ? reject(err) : resolve(res));
    }
  });
});



const createBulkInsertQuery = votes => ({
  body: votes.reduce((acc, vote) => {
          acc.push({ index: { _index: indexName, _type: indexType } });
          acc.push(vote); // vote is formatted, considering parsing phase
          return acc;
        }, [])
});






const createFreshIndex = () => new Promise((resolve, reject) => {
  if (!client) openClient(); // open client
  
  const closeAndResolve = res => { closeClient(); resolve(res); }; // resolve helper
  const closeAndReject  = err => { closeClient(); reject(err); };  // reject helper

  const worflow = indexExists => (indexExists) ? flushIndex : createIndex; // worflow helper
  
  checkIndexExists(indexName)
    .then(indexExists => worflow(indexExists)(indexName, indexType, mappings) // create or flush if exists
      .then(closeAndResolve) // ok
      .catch(closeAndReject) // fail
    )
    .catch(closeAndReject) // fail
});



const insert = votes => new Promise((resolve, reject) => {
  if (!client) openClient(); // open client

  client.bulk(createBulkInsertQuery(votes), (err, res) => {
    closeClient();
    if (err) reject(err);
    else     resolve(res);
  });
});



module.exports = (_indexName, _indexType, _mappings) => {
  indexName = _indexName;
  indexType = _indexType;
  mappings = _mappings;
  return ({
    createFreshIndex,
    insert
  });
};
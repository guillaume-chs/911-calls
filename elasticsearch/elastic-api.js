const elasticsearch = require('elasticsearch');

let indexName;
let indexType;
let client = undefined;

const getClient = () => 
  new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info' // 'error'
  });

const closeClient = () => {
  client.close();
  client = undefined;
}



const deleteIndexIfExists = (indexName) => new Promise((resolve, reject) => {
  if (!client) reject(new Error('client is undefined'));

  client.indices.exists({ index: indexName }, (err, indexExists) => {
    if (err) reject(err);
    
    else if (indexExists) {
      client.indices.delete({ index: indexName }, (err, res) => {
        if (err) reject(err);
        else     resolve();
      })
    }

    else resolve();
  }
)});



const createIndex = (indexName, typeName, mappings) => new Promise((resolve, reject) => {
  if (!client) reject(new Error('client is undefined'));

  client.indices.create({ index: indexName }, (err, res) => {
    if (err) reject(err);

    if (!!mappings) {
      client.indices.putMapping({
        index: indexName,
        type: 'voteresult',
        body: {
          'voteresult': {
            properties: { ...mappings }
          }
        }
      }, (err, res) => (!!err) ? reject(err) : resolve());
    }
  });
});



const createFreshIndex = (mappings) => {
  if (!client) client = getClient();

  deleteIndexIfExists(indexName)
    .then(() => { // resolve
      createIndex(indexName, indexType, mappings)
        .then(() => closeClient())
        .catch(() => closeClient())
    })
    .catch((err) => { // reject
      console.trace(err);
      closeClient();
    })
};



const createBulkInsertQuery = votes => ({
  body: votes.reduce((acc, vote) => {
          acc.push({ index: { _index: indexName, _type: indexType } });
          acc.push(vote); // vote is formatted, considering parsing phase
          return acc;
        }, [])
});

const insert = (votes) => new Promise((resolve, reject) => {
  if (!client) client = getClient();
  client.bulk(createBulkInsertQuery(votes), (err, res) => {
    client.close();
    if (err) reject(err);
    else     resolve(res);
  });
});



module.exports = (_indexName, _indexType) => {
  indexName = _indexName;
  indexType = _indexType;
  return ({
    createFreshIndex,
    insert
  });
};
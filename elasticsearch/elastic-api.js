const elasticsearch = require('elasticsearch');


let client = undefined;

const getClient = () => 
  new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info' // 'error'
  });



const deleteIndexIfExists = (indexName) => new Promise((resolve, reject) => {
  if (!client) client = getClient();

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



const createIndex = (indexName, typeName, mappings) => {
  if (!client) client = getClient();

  client.indices.create({ index: indexName }, (err, res) => {
    if (err) {
      console.trace(err.message);
      return;
    }

    if (!!mappings) {
      client.indices.putMapping({
        index: indexName,
        type: 'voteresult',
        body: {
          'voteresult': {
            properties: { ...mappings }
          }
        }
      }, (err, res) => {
        if (err) console.trace(err.message);
      });
    }
  });
};



const createFreshIndex = (indexName, typeName, mappings) => {
  if (!client) client = getClient();

  deleteIndexIfExists(indexName)
    .then(() => createIndex(indexName, typeName, mappings)) // resolve
    .catch((err) => console.trace(err)); // reject
};



module.exports = {
  createFreshIndex
};
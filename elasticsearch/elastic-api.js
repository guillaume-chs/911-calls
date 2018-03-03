const elasticsearch = require('elasticsearch');


let client = undefined;

const getClient = () => 
  new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info' // 'error'
  });



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



const createFreshIndex = (indexName, typeName, mappings) => {
  if (!client) client = getClient();

  deleteIndexIfExists(indexName)
    .then(() => { // resolve
      createIndex(indexName, typeName, mappings)
        .then(() => client.close())
        .catch(() => client.close())
    })
    .catch((err) => { // reject
      console.trace(err);
      client.close();
    })
};



module.exports = {
  createFreshIndex
};
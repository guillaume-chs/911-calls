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

  else client.indices.exists({ index: indexName, expandWildcards: 'all' }, (err, res) => {
      if (err) reject(err);
      else     resolve(res);
  });
});



const deleteIndex = indexName => new Promise((resolve, reject) => {
  console.log('Deleting index');
  if (!client) reject(new Error('client is undefined'));

  else client.indices.delete({ index: indexName }, (err, res) => {
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
          acc.push(vote);
          return acc;
        }, [])
});






const createFreshIndex = () => new Promise((resolve, reject) => {
  if (!client) openClient(); // open client
  
  const closeAndResolve = res => { closeClient(); resolve(res); }; // resolve helper
  const closeAndReject  = err => { closeClient(); reject(err); };  // reject helper
  
  checkIndexExists(indexName)
    .then(indexExists => {
      console.log('Index exists : ' + indexExists);
      if (indexExists) {
        deleteIndex(indexName)
        .catch(closeAndReject)
        .then(res => {
          createIndex(indexName, indexType, mappings)
          .then(closeAndResolve) // ok
          .catch(closeAndReject) // fail
        })
      }
      else {
        createIndex(indexName, indexType, mappings)
        .then(closeAndResolve) // ok
        .catch(closeAndReject) // fail
      }
    })
    .catch(closeAndReject);
});



const insert = votes => new Promise((resolve, reject) => {
  if (!client) openClient(); // open client
  
  // Votes are too big, still (despite fragmented in 5)
  // Split votes in three chunks
  // Avoid ("Request too big")
  const third = Math.ceil(votes.length / 3); // about 50.000 lines
  const getVoteChunk = i => 
    votes.slice(third*i, (i < 2) ? third*(i+1) : votes.length);

  const insertAsync = i => new Promise((resolve, reject) => {
    client.bulk(createBulkInsertQuery(votes.slice(third*i, (i < 2) ? third*(i+1) : votes.length)), (err, res) => { // callback helper
      if (err) reject(err.message);
      else     resolve();
    });
  });

  Promise.all( Array.of(0,1,2).map(insertAsync) )
    .then(() => { resolve(votes.length) })
    .catch(err => { reject(err); });

  // const insertRecursively = i => new Promise((resolve, reject) => {
  //   if (i >= 3) resolve(votes.length);

  //   else client.bulk(createBulkInsertQuery(votes.slice(third*i, Math.max(third*(i+1), votes.length))), (err, res) => { // callback helper
  //     if (err) reject(err.message);
  //     else
  //       insertRecursively(i+1)
  //         .then(() => resolve())
  //   });
  // });

  // insertRecursively(0)
  //   .then(() => {
  //     closeClient();
  //     resolve(votes.length);
  //   })
  //   .catch(err => {
  //     closeClient();
  //     reject(err);
  //   });

  // for (let i = 0; i < 100 && ok; i++) {
  //   createBulkInsertQuery(votes.slice(percent*i, Math.max(percent*(i+1), votes.length)))
  //     .then(body => client.bulk(body, handleError))
  //     .catch(handleError);
  // }

  // console.log(votes[0]);
  // const body = createBulkInsertQuery(votes.slice(0, 3));
  // console.log(body.body[1]);
  // console.log(body.body[2]);
  
  // client.bulk(createBulkInsertQuery(votes.slice(0,50000)), (err, res) => {
  //   if (err) reject(err.message);
  //   else resolve(votes.length);
  // });
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
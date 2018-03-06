const MongoClient = require('mongodb').MongoClient;
const mongoHost = require('../constants').MONGO_HOST;

let dbName;
let dbURL;
let collName;
let mappings;

const newIndex = () => new Promise((resolve, reject) => {
    MongoClient.connect(dbURL, (err, db) => {
        if (err) reject(err);
        else {
            db.dropCollection(collName);
            const client = db.collection(collName);
            mappings.forEach(index => client.createIndex(index));
            resolve();
        }
    });
});

const insert = votes => new Promise((resolve, reject) => {
    MongoClient.connect(dbURL, (err, db) => {
        if (err) reject(err);
        else {
            db.collection(collName)
                .insertMany(votes, (err, res) => {
                    if (err) reject(err.message);
                    else     resolve(res.insertedCount);
                });
        }
    });
});

module.exports = (_dbName, _collName, _mappings) => {
    dbName = _dbName;
    dbURL = mongoHost + dbName;
    collName = _collName;
    mappings = _mappings;
    return ({
        newIndex,
        insert
    });
};
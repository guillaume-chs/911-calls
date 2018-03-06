module.exports = {
    DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
    TITLE_DELIMITER: ':',
    INDEX_NAME: 'fr_election_2017',
    INDEX_TYPE: 'voteresult',
    DATA_FOLDER: 'data',
    CONTEXTS: {
        ELASTIC: 'elastic',
        MONGO: 'mongo'
    },
    MONGO_HOST: 'mongodb://localhost:27017/',
    ELASTIC_HOST: 'localhost:9200',
};
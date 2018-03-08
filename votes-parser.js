const CONTEXTS = require('./constants').CONTEXTS;
let context = undefined;


const parseGeo = str => {
    let lat  = undefined,
        long = undefined;

    if (!!str) {
        const {[0]: _lat, [1]: _long} = str.split(','); // destructuring because it's funny
        lat = _lat.trim();
        long = _long.trim();
    }
    
    // Output depending on context
    switch (context) {
        case CONTEXTS.ELASTIC: return ({ lat, long });

        case CONTEXTS.MONGO: return ({
            type: "Point",
            coordinates: [ parseFloat(lat), parseFloat(long) ]
        });
    }
}

const parseNumber = str => (context===CONTEXTS.MONGO) ? parseInt(str) : str;
const parseFloatNumber = str => (context===CONTEXTS.MONGO) ? parseFloat(str) : str;

const parseVotes = data => ({
    geography: {
        department_code: data['Department code'],
        department_name: data['Department'],
        constituency_code: data['Constituency code'],
        constituency_name: data['Constituency'],
        commune_code: data['Commune code'],
        commune_name: data['Commune'],
        address: data['Address'],
        postcode: data['Postal code'],
        city: data['City'],
    },
    
    polling_station: {
        id: data['Polling station'],
        name: data['Polling station name'],
        insee: data['INSEE code'],
        unique: data['Poll.St.-unique'],
        coordinates: parseGeo(data['Coordinates']),
    },

    polling_data: {
        registered: parseNumber(data['Registered']),
        abstentions: parseNumber(data['Abstentions']),
        abstentions_ratio: parseFloatNumber(data['% Abs/Reg']),
        
        voters: parseNumber(data['Voters']),
        voters_ratio: parseFloatNumber(data['% Vot/Reg']),
        
        others: parseNumber(data['None of the above(NOTA)']),
        others_ratio_reg: parseFloatNumber(data['% NOTA/Reg']),
        others_ratio_vot: parseFloatNumber(data['% NOTA/Vot']),
        
        nulls: parseNumber(data['Nulls']),
        nulls_ratio_reg: parseFloatNumber(data['% Nulls/Reg']),
        nulls_ratio_vot: parseFloatNumber(data['% Nulls/Vot']),
        
        expressed: parseNumber(data['Expressed']),
        expressed_ratio_reg: parseFloatNumber(data['% Exp/Reg']),
        expressed_ratio_vot: parseFloatNumber(data['% Exp/Vot']),
    },
    
    winner: {
        signboard: data['Signboard'],
        sex: data['Sex'],
        surname: data['Surname'],
        firstname: data['First name'],
        
        votes: parseNumber(data['Voted']),
        votes_ratio_reg: parseFloatNumber(data['% Votes/Reg']),
        votes_ratio_exp: parseFloatNumber(data['% Votes/Exp']),
    }
});

const getElasticMappings = () => ({
    'geography.coordinates': {
        type: 'geo_point'
    },

    'polling_data.registered': { type: 'integer' },
    'polling_data.abstentions': { type: 'integer' },
    'polling_data.voters': { type: 'integer' },
    'polling_data.others': { type: 'integer' },
    'polling_data.nulls': { type: 'integer' },
    'polling_data.expressed': { type: 'integer' },

    'polling_data.abstentions_ratio': { type: 'float' },
    'polling_data.voters_ratio': { type: 'float' },
    'polling_data.others_ratio_reg': { type: 'float' },
    'polling_data.others_ratio_vot': { type: 'float' },
    'polling_data.nulls_ratio_reg': { type: 'float' },
    'polling_data.nulls_ratio_vot': { type: 'float' },
    'polling_data.expressed_ratio_reg': { type: 'float' },
    'polling_data.expressed_ratio_vot': { type: 'float' },

    'winner.signboard': { type: 'integer' },
    'winner.votes': { type: 'integer' },
    'winner.votes_ratio_reg': { type: 'float' },
    'winner.votes_ratio_exp': { type: 'float' }
});

const getMongoMappings = () => ([
    { location : "2dsphere" },
    { title: 'text' }
]);

module.exports = (_context) => {
    if (_context === undefined || (_context !== CONTEXTS.ELASTIC && _context !== CONTEXTS.MONGO))
        throw new Error('Use Case undefined');

    context = _context;
    switch (context) {
        case CONTEXTS.ELASTIC: return ({
            parseVotes,
            mappings: getElasticMappings()
        })

        case CONTEXTS.MONGO: return ({
            parseVotes,
            mappings: getMongoMappings()
        })
    }
};
const TITLE_DELIMITER = require('./constants').TITLE_DELIMITER;

const parseTitle = (rawTitle) => {
    const parsed = rawTitle.split(TITLE_DELIMITER);
    return ({
        category: parsed[0].trim(),
        title: parsed[1].trim()
    });
}

const parseGeo = (str) => {
    let {[0]: lat, [1]:long} = str.split(',')
    return { lat: lat.trim(), long: long.trim() };   
}

const parseVotes = (data) => ({
    geography: {
        department_code: data['Department code'],
        department_name: data['Department'],
        constituency_code: data['Constitution code'],
        constituency_name: data['Constitution'],
        commune_code: data['Commune code'],
        commune_name: data['Commune'],
        address: data['Address'],
        postcode: data['Postal code'],
        city: data['City'],
        unique: data['Poll.St-unique']
    },

    polling_station: {
        id: data['Polling Station'],
        name: data['Polling station name'],
        insee: data['INSEE code'],
        coordinates: parseGeo(data['Coordinates']),
    },

    polling_data: {
        registered: data['Registered'],
        abstentions: data['Abstentions'],
        abstentions_ratio: data['% Abs/Reg'],
        
        voters: data['Voters'],
        voters_ratio: data['% Vot/Reg'],
        
        others: data['None of the above(NOTA)'],
        others_ratio_reg: data['% NOTA/Reg'],
        others_ratio_vot: data['% NOTA/Vot'],
        
        nulls: data['Nulls'],
        nulls_ratio_reg: data['% Nulls/Reg'],
        nulls_ratio_vot: data['% Nulls/Vot'],
        
        expressed: data['Expressed'],
        expressed_ratio_reg: data['% Exp/Reg'],
        expressed_ratio_vot: data['% Exp/Vot'],
    },
    
    winner: {
        signboard: data['Signboard'],
        sex: data['Sex'],
        surname: data['Surname'],
        firstname: data['First name'],
        
        votes: data['Voted'],
        votes_ratio_reg: data['% Votes/Reg'],
        votes_ratio_exp: data['% Votes/Exp'],
    }
});

const getMappings = () => ({
    coordinates: { type: "geo_point" }
});

module.exports.parseVotes = parseVotes;
module.exports.mappings = getMappings();
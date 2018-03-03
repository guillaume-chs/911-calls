const TITLE_DELIMITER = require('./constants').TITLE_DELIMITER;

const parseTitle = (rawTitle) => {
    const parsed = rawTitle.split(TITLE_DELIMITER);
    return ({
        category: parsed[0].trim(),
        title: parsed[1].trim()
    });
}

// let {[0]: lat, [1]:long} = str.split(',');

const parseVotes = (data) => ({
    dep_code: data['Department code'],
    dep_name: data['Department']
});


// const parseVotes = (data) => ({
//     ...{ cat:category, title } = parseTitle(data.title),
//     location: {
//       lat: data.lat,
//       lng: data.lng
//     },
//     desc: data.desc,
//     zip: data.zip,
//     tmstp: data.timeStamp,
//     neigbr: data.twp,
//     addr: data.addr,
//     e: data.e
// });

module.exports = parseVotes;
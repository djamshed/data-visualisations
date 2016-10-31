"use strict";

const fs = require('fs');

const SRC_DIR = './tables/';

const start = () => {
  const seasons = seasonYears([1992, 2016]);

  // tables for each season
  const seasonTablePromises = seasons.map(season => {
    return new Promise( (resolve, reject) => {
      fs.readFile(SRC_DIR + 'epl-' + season + '.json', 'utf8', function (err, data) {
        if (err) throw reject(err);
        resolve({season: season, table: JSON.parse(data)});
      });
    });
  })

  // process data
  Promise
    .all(seasonTablePromises)
    .then(seasonData => {
      return new Promise((resolve, reject) => {
        let result = [];
        for(var i = 0; i < seasonData.length - 1; i++) {
          const currentData = seasonData[i],
                nextTable = seasonData[i + 1].table.map( d=> d.team),
                champ = currentData.table[0].team,
                nextYearRank = nextTable.indexOf(champ) + 1
          ;
          console.log(currentData.season, champ, nextYearRank)
          result.push({
            season: currentData.season,
            champ: champ,
            nextRank: nextYearRank
          });
        }
        // return [{season, champ, nextRank}]
        resolve(result);
      });
    })
    .then(ranks => {
      console.log(ranks);
    })
}



/// --------- functions

// return an array of season years (eg: '96-97' )
const seasonYears = range => {
  let y = [];
  for(var i = range[0]; i <= range[1]; i++) {
    y.push(String(i).substr(2) + '-' + String(i+1).substr(2));
  }
  return y;
}

// clean table files
const readTables = years => {
  years.forEach( (year, i) => {
    fs.readFileSync(SRC_DIR + 'epl-' + year + '.json', 'utf8', function (err, data) {
      if (err) throw err;
      let table = JSON.parse(data);
      table.forEach(row => {
        // team name data contained trailing spaces and
        // duplicated strings like "Arsenal !Arsenal"
        let indexOfExcl = row.team.indexOf('!');
        row.team = indexOfExcl > -1 ? row.team.slice(0, indexOfExcl).trim() : row.team.trim();
      });
      let str = JSON.stringify(table, null, 3);
      str = str.replace(/": /g, '":');
      fs.writeFile(OUT_DIR + 'epl-' + year + '.json', str)
    });
  })
}

start();
// readTables(years);
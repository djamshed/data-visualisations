"use strict";

const fs = require('fs');

const SRC_DIR = './tables/',
      OUT_DIR = './tables/'
;

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
const cleanTables = years => {
  years.forEach( (year, i) => {
    fs.readFile(SRC_DIR + 'epl-' + year + '.json', 'utf8', function (err, data) {
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

let years = seasonYears([1992, 2014]),
    champs = [],
    teams = {}
;

cleanTables(years);
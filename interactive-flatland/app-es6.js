var draw = data => {
  // dimensions
  const marginLeft = 40;
  const continentWidth = 80;
  const continentMargin = 10;
  const height = 600;

  // DOM references
  const container = d3.select('#container');
  const searchTxt = d3.select('.search-txt');
  const chart = d3.select('#chart').style('height', height + 'px');

  const yScale = d3.scale.linear()
    .domain([90, -90])
    .range([0, height]);
  // y position of each continent block
  let continentStartY = {};
  data.forEach(d => continentStartY[d.continent] = yScale(d.latRange[0]));

  // add bounds
  chart.selectAll('.bound').data(d3.range(-90, 90.1, 30).reverse())
    .enter()
    .append('div')
    .attr('class', 'bound')
    .style('position', 'absolute')
    .style('top', d => yScale(d) + 'px')
    .style('width', '100%')
    .text(d => d + '°');

  // add continents
  const continentEnter = chart.selectAll('.continent').data(data)
    .enter()
    .append('div')
    .attr('class', 'continent')
    .style('position', 'absolute')
    .style('top', d => yScale(d.latRange[0]) + 'px')
    .style('height', d => yScale(d.latRange[1]) - yScale(d.latRange[0]) + 'px')
    .style('left', (d, i) => marginLeft + i * (continentWidth + continentMargin) + 'px')
    .style('width', continentWidth + 'px')
    .append('span')
    .attr('class', 'continent-label')
    .text(d => d.continent);

  // add cities
  d3.select('#chart').selectAll('.continent').selectAll('city').data(d => d.cities)
    .enter()
    .append('div')
    .attr('class', 'city')
    .classed('capital', d => d.isCapital)
    .classed('top', d => d.populationRank < 21)
    .style('position', 'absolute')
    .style('top', d => (yScale(d.lat) - continentStartY[d.continent]) + 'px')
    .append('span')
    .attr('class', 'city__label')
    .text(d => d.city);

  // add hover line
  chart
    .append('div')
    .attr('class', 'hover-line')
    .append('span')
    .attr('class', 'hover-text');

  // ------------- interaction handlers
  const line = d3.select('.hover-line');
  const lineText = line.select('.hover-text');
  const cities = chart.selectAll('.city');

  // mouse move (updates hover line)
  chart.on('mousemove', () => {
    let xy = d3.mouse(chart.node());
    let lat = Math.round(yScale.invert(xy[1]));

    let continent = {};
    // find 'close' cities
    const closeCities = cities
      .classed('close', false)
      // find close cities
      .filter(d => Math.abs(d.lat - lat) < 3)
      .each(function(d){
        if (!continent[d.continent]) {
          continent[d.continent] = [];
        }
        continent[d.continent].push({city: this, diff: Math.abs(d.lat - lat)});
      })
    ;
    for (let x in continent) {
      continent[x].sort( (a, b) => a.diff - b.diff );
      // pick the closest city
      d3.select(continent[x][0].city).classed('close', true)
    }


    // update hover line
    line.style('top', xy[1] + 'px');
    lineText.text(lat + '°');
    // update details
    updateDetails(chart.selectAll('.city.sticky, .city.close').data());
  });
  // click (adds sticky cities)
  chart.on('click', () => {
    chart.selectAll('.city.close').classed('sticky', true);
  })

  // capitals/top cities toggle handlers
  d3.select('.btn-capitals').on('click', () => {
    container.classed('show-capitals', !container.classed('show-capitals'));
  });
  d3.select('.btn-top').on('click', () => {
    container.classed('show-top', !container.classed('show-top'));
  });
  // clear click handler
  d3.select('.btn-clear').on('click', () => {
    d3.event && d3.event.preventDefault();
    container.classed('show-top', false);
    container.classed('show-capitals', false);
    cities.classed('sticky', false);
    searchTxt.property('value', '');
    updateDetails([]);
  });
  // searchbox selection change handler
  searchTxt.on('awesomplete-select', () => {
    var label = d3.event.text.label;
    // add city as 'sticky'
    cities
      .filter(d => d.city === label)
      .classed('sticky', true);
    // update details
    updateDetails(chart.selectAll('.city.sticky, .city.close').data());
  });

  // ------ sticky, close cities' details
  const populationFormatter = d3.format(',.3s');
  const latFormatter = d3.format(',.1f');
  const updateDetails = data => {
    const detailTextFx = d => '<div><strong>' + d.city + '</strong>, ' + d.country + ' (' + latFormatter(d.lat) + '°, ' + populationFormatter(d.population) + ' ppl)</div>';

    // enter
    const details = d3.select('#details').selectAll('.detail-item').data(data, d => d.city);
    details
      .enter()
      .append('div')
      .attr('class', 'detail-item');
    // update
    details.html(detailTextFx);
    // exit
    details
      .exit()
      .remove();
  };

}

// data
var data = [{
  "continent": "N. America",
  "cities": [{
    "city": "Mexico City",
    "country": "Mexico",
    "continent": "N. America",
    "lat": 19.428,
    "population": 12294193,
    "isCapital": true,
    "populationRank": 4
  }, {
    "city": "New York",
    "country": "United States",
    "continent": "N. America",
    "lat": 40.714,
    "population": 8175133,
    "isCapital": false,
    "populationRank": 20
  }, {
    "city": "Los Angeles",
    "country": "United States",
    "continent": "N. America",
    "lat": 34.052,
    "population": 3792621,
    "isCapital": false,
    "populationRank": 49
  }, {
    "city": "Chicago",
    "country": "United States",
    "continent": "N. America",
    "lat": 41.85,
    "population": 2695598,
    "isCapital": false,
    "populationRank": 79
  }, {
    "city": "Toronto",
    "country": "Canada",
    "continent": "N. America",
    "lat": 43.7,
    "population": 2600000,
    "isCapital": false,
    "populationRank": 81
  }, {
    "city": "Brooklyn",
    "country": "United States",
    "continent": "N. America",
    "lat": 40.65,
    "population": 2300664,
    "isCapital": false,
    "populationRank": 96
  }, {
    "city": "Queens",
    "country": "United States",
    "continent": "N. America",
    "lat": 40.681,
    "population": 2272771,
    "isCapital": false,
    "populationRank": 97
  }, {
    "city": "Santo Domingo",
    "country": "Dominican Republic",
    "continent": "N. America",
    "lat": 18.5,
    "population": 2201941,
    "isCapital": true,
    "populationRank": 100
  }, {
    "city": "Havana",
    "country": "Cuba",
    "continent": "N. America",
    "lat": 23.133,
    "population": 2163824,
    "isCapital": true,
    "populationRank": 103
  }, {
    "city": "Guatemala City",
    "country": "Guatemala",
    "continent": "N. America",
    "lat": 14.641,
    "population": 994938,
    "isCapital": true,
    "populationRank": 257
  }, {
    "city": "Kingston",
    "country": "Jamaica",
    "continent": "N. America",
    "lat": 17.997,
    "population": 937700,
    "isCapital": true,
    "populationRank": 269
  }, {
    "city": "San Salvador",
    "country": "El Salvador",
    "continent": "N. America",
    "lat": 13.689,
    "population": 525990,
    "isCapital": true,
    "populationRank": 419
  }, {
    "city": "Panama City",
    "country": "Panama",
    "continent": "N. America",
    "lat": 8.994,
    "population": 408168,
    "isCapital": true,
    "populationRank": 484
  }, {
    "city": "Nuuk",
    "country": "Greenland",
    "continent": "N. America",
    "lat": 64.183,
    "population": 14798,
    "isCapital": true,
    "populationRank": 1684
  }, {
    "city": "Port-au-Prince",
    "country": "Haiti",
    "continent": "N. America",
    "lat": 18.539,
    "population": 1234742,
    "isCapital": true,
    "populationRank": 216
  }, {
    "city": "Managua",
    "country": "Nicaragua",
    "continent": "N. America",
    "lat": 12.133,
    "population": 973087,
    "isCapital": true,
    "populationRank": 260
  }, {
    "city": "Tegucigalpa",
    "country": "Honduras",
    "continent": "N. America",
    "lat": 14.082,
    "population": 850848,
    "isCapital": true,
    "populationRank": 285
  }, {
    "city": "Ottawa",
    "country": "Canada",
    "continent": "N. America",
    "lat": 45.411,
    "population": 812129,
    "isCapital": true,
    "populationRank": 296
  }, {
    "city": "Washington",
    "country": "United States",
    "continent": "N. America",
    "lat": 38.9072,
    "population": 601723,
    "isCapital": "true",
    "populationRank": 379
  }, {
    "city": "San Juan",
    "country": "Puerto Rico",
    "continent": "N. America",
    "lat": 18.466,
    "population": 418140,
    "isCapital": true,
    "populationRank": 477
  }, {
    "city": "Nassau",
    "country": "Bahamas",
    "continent": "N. America",
    "lat": 25.058,
    "population": 227940,
    "isCapital": true,
    "populationRank": 678
  }, {
    "city": "Willemstad",
    "country": "Curacao",
    "continent": "N. America",
    "lat": 12.108,
    "population": 125000,
    "isCapital": true,
    "populationRank": 932
  }, {
    "city": "Bridgetown",
    "country": "Barbados",
    "continent": "N. America",
    "lat": 13.1,
    "population": 98511,
    "isCapital": true,
    "populationRank": 1036
  }, {
    "city": "Fort-de-France",
    "country": "Martinique",
    "continent": "N. America",
    "lat": 14.609,
    "population": 89995,
    "isCapital": true,
    "populationRank": 1078
  }, {
    "city": "Port of Spain",
    "country": "Trinidad and Tobago",
    "continent": "N. America",
    "lat": 10.667,
    "population": 49031,
    "isCapital": true,
    "populationRank": 1330
  }, {
    "city": "Santiago",
    "country": "Panama",
    "continent": "N. America",
    "lat": 8.1,
    "population": 45355,
    "isCapital": true,
    "populationRank": 1362
  }, {
    "city": "Oranjestad",
    "country": "Aruba",
    "continent": "N. America",
    "lat": 12.524,
    "population": 29998,
    "isCapital": true,
    "populationRank": 1485
  }, {
    "city": "George Town",
    "country": "Cayman Islands",
    "continent": "N. America",
    "lat": 19.287,
    "population": 29370,
    "isCapital": true,
    "populationRank": 1490
  }, {
    "city": "Kingstown",
    "country": "Saint Vincent and the Grenadines",
    "continent": "N. America",
    "lat": 13.159,
    "population": 24518,
    "isCapital": true,
    "populationRank": 1548
  }, {
    "city": "St. John's",
    "country": "Antigua and Barbuda",
    "continent": "N. America",
    "lat": 17.117,
    "population": 24226,
    "isCapital": true,
    "populationRank": 1550
  }, {
    "city": "Castries",
    "country": "Saint Lucia",
    "continent": "N. America",
    "lat": 13.996,
    "population": 20000,
    "isCapital": true,
    "populationRank": 1601
  }, {
    "city": "Charlotte Amalie",
    "country": "U.S. Virgin Islands",
    "continent": "N. America",
    "lat": 18.342,
    "population": 20000,
    "isCapital": true,
    "populationRank": 1602
  }, {
    "city": "Roseau",
    "country": "Dominica",
    "continent": "N. America",
    "lat": 15.302,
    "population": 16571,
    "isCapital": true,
    "populationRank": 1654
  }, {
    "city": "Belmopan",
    "country": "Belize",
    "continent": "N. America",
    "lat": 17.25,
    "population": 13381,
    "isCapital": true,
    "populationRank": 1701
  }, {
    "city": "Basseterre",
    "country": "Saint Kitts and Nevis",
    "continent": "N. America",
    "lat": 17.295,
    "population": 12920,
    "isCapital": true,
    "populationRank": 1710
  }],
  "latRange": [72, 7.208889]
}, {
  "continent": "S. America",
  "cities": [{
    "city": "Buenos Aires",
    "country": "Argentina",
    "continent": "S. America",
    "lat": -34.613,
    "population": 13076300,
    "isCapital": true,
    "populationRank": 2
  }, {
    "city": "Sao Paulo",
    "country": "Brazil",
    "continent": "S. America",
    "lat": -23.547,
    "population": 10021295,
    "isCapital": false,
    "populationRank": 15
  }, {
    "city": "Lima",
    "country": "Peru",
    "continent": "S. America",
    "lat": -12.043,
    "population": 7737002,
    "isCapital": true,
    "populationRank": 24
  }, {
    "city": "Bogota",
    "country": "Colombia",
    "continent": "S. America",
    "lat": 4.61,
    "population": 7674366,
    "isCapital": true,
    "populationRank": 26
  }, {
    "city": "Rio de Janeiro",
    "country": "Brazil",
    "continent": "S. America",
    "lat": -22.903,
    "population": 6023699,
    "isCapital": false,
    "populationRank": 36
  }, {
    "city": "Santiago",
    "country": "Chile",
    "continent": "S. America",
    "lat": -33.457,
    "population": 4837295,
    "isCapital": true,
    "populationRank": 40
  }, {
    "city": "Caracas",
    "country": "Venezuela",
    "continent": "S. America",
    "lat": 10.488,
    "population": 3000000,
    "isCapital": true,
    "populationRank": 67
  }, {
    "city": "Salvador",
    "country": "Brazil",
    "continent": "S. America",
    "lat": -12.971,
    "population": 2711840,
    "isCapital": false,
    "populationRank": 77
  }, {
    "city": "Fortaleza",
    "country": "Brazil",
    "continent": "S. America",
    "lat": -3.717,
    "population": 2400000,
    "isCapital": false,
    "populationRank": 90
  }, {
    "city": "Santiago de Cali",
    "country": "Colombia",
    "continent": "S. America",
    "lat": 3.437,
    "population": 2392877,
    "isCapital": false,
    "populationRank": 91
  }, {
    "city": "Belo Horizonte",
    "country": "Brazil",
    "continent": "S. America",
    "lat": -19.921,
    "population": 2373224,
    "isCapital": false,
    "populationRank": 93
  }, {
    "city": "Maracaibo",
    "country": "Venezuela",
    "continent": "S. America",
    "lat": 10.667,
    "population": 2225000,
    "isCapital": false,
    "populationRank": 98
  }, {
    "city": "Brasília",
    "country": "Brazil",
    "continent": "S. America",
    "lat": -15.78,
    "population": 2207718,
    "isCapital": false,
    "populationRank": 99
  }, {
    "city": "Quito",
    "country": "Ecuador",
    "continent": "S. America",
    "lat": -0.23,
    "population": 1399814,
    "isCapital": true,
    "populationRank": 178
  }, {
    "city": "Montevideo",
    "country": "Uruguay",
    "continent": "S. America",
    "lat": -34.903,
    "population": 1270737,
    "isCapital": true,
    "populationRank": 207
  }, {
    "city": "Georgetown",
    "country": "Guyana",
    "continent": "S. America",
    "lat": 6.804,
    "population": 235017,
    "isCapital": true,
    "populationRank": 663
  }, {
    "city": "Sucre",
    "country": "Bolivia",
    "continent": "S. America",
    "lat": -19.033,
    "population": 224838,
    "isCapital": true,
    "populationRank": 686
  }, {
    "city": "Paramaribo",
    "country": "Suriname",
    "continent": "S. America",
    "lat": 5.866,
    "population": 223757,
    "isCapital": true,
    "populationRank": 689
  }, {
    "city": "Cayenne",
    "country": "French Guiana",
    "continent": "S. America",
    "lat": 4.933,
    "population": 61550,
    "isCapital": true,
    "populationRank": 1248
  }],
  "latRange": [12.458611, -53.896389]
}, {
  "continent": "Africa",
  "cities": [{
    "city": "Lagos",
    "country": "Nigeria",
    "continent": "Africa",
    "lat": 6.454,
    "population": 9000000,
    "isCapital": false,
    "populationRank": 17
  }, {
    "city": "Kinshasa",
    "country": "Democratic Republic of the Congo",
    "continent": "Africa",
    "lat": -4.328,
    "population": 7785965,
    "isCapital": true,
    "populationRank": 23
  }, {
    "city": "Cairo",
    "country": "Egypt",
    "continent": "Africa",
    "lat": 30.063,
    "population": 7734614,
    "isCapital": true,
    "populationRank": 25
  }, {
    "city": "Alexandria",
    "country": "Egypt",
    "continent": "Africa",
    "lat": 31.216,
    "population": 3811516,
    "isCapital": false,
    "populationRank": 48
  }, {
    "city": "Abidjan",
    "country": "Ivory Coast",
    "continent": "Africa",
    "lat": 5.31,
    "population": 3677115,
    "isCapital": false,
    "populationRank": 52
  }, {
    "city": "Kano",
    "country": "Nigeria",
    "continent": "Africa",
    "lat": 12,
    "population": 3626068,
    "isCapital": false,
    "populationRank": 53
  }, {
    "city": "Ibadan",
    "country": "Nigeria",
    "continent": "Africa",
    "lat": 7.378,
    "population": 3565108,
    "isCapital": false,
    "populationRank": 56
  }, {
    "city": "Cape Town",
    "country": "South Africa",
    "continent": "Africa",
    "lat": -33.926,
    "population": 3433441,
    "isCapital": false,
    "populationRank": 60
  }, {
    "city": "Casablanca",
    "country": "Morocco",
    "continent": "Africa",
    "lat": 33.588,
    "population": 3144909,
    "isCapital": false,
    "populationRank": 64
  }, {
    "city": "Durban",
    "country": "South Africa",
    "continent": "Africa",
    "lat": -29.858,
    "population": 3120282,
    "isCapital": false,
    "populationRank": 65
  }, {
    "city": "Luanda",
    "country": "Angola",
    "continent": "Africa",
    "lat": -8.837,
    "population": 2776168,
    "isCapital": true,
    "populationRank": 73
  }, {
    "city": "Addis Ababa",
    "country": "Ethiopia",
    "continent": "Africa",
    "lat": 9.025,
    "population": 2757729,
    "isCapital": true,
    "populationRank": 75
  }, {
    "city": "Nairobi",
    "country": "Kenya",
    "continent": "Africa",
    "lat": -1.283,
    "population": 2750547,
    "isCapital": true,
    "populationRank": 76
  }, {
    "city": "Dar es Salaam",
    "country": "Tanzania",
    "continent": "Africa",
    "lat": -6.823,
    "population": 2698652,
    "isCapital": false,
    "populationRank": 78
  }, {
    "city": "Mogadishu",
    "country": "Somalia",
    "continent": "Africa",
    "lat": 2.037,
    "population": 2587183,
    "isCapital": true,
    "populationRank": 84
  }, {
    "city": "Dakar",
    "country": "Senegal",
    "continent": "Africa",
    "lat": 14.694,
    "population": 2476400,
    "isCapital": true,
    "populationRank": 88
  }, {
    "city": "Giza",
    "country": "Egypt",
    "continent": "Africa",
    "lat": 30.008,
    "population": 2443203,
    "isCapital": false,
    "populationRank": 89
  }, {
    "city": "Tunis",
    "country": "Tunisia",
    "continent": "Africa",
    "lat": 36.819,
    "population": 693210,
    "isCapital": true,
    "populationRank": 347
  }, {
    "city": "Algiers",
    "country": "Algeria",
    "continent": "Africa",
    "lat": 36.753,
    "population": 1977663,
    "isCapital": true,
    "populationRank": 113
  }, {
    "city": "Khartoum",
    "country": "Sudan",
    "continent": "Africa",
    "lat": 15.552,
    "population": 1974647,
    "isCapital": true,
    "populationRank": 114
  }, {
    "city": "Accra",
    "country": "Ghana",
    "continent": "Africa",
    "lat": 5.556,
    "population": 1963264,
    "isCapital": true,
    "populationRank": 115
  }, {
    "city": "Conakry",
    "country": "Guinea",
    "continent": "Africa",
    "lat": 9.538,
    "population": 1767200,
    "isCapital": true,
    "populationRank": 125
  }, {
    "city": "Rabat",
    "country": "Morocco",
    "continent": "Africa",
    "lat": 34.013,
    "population": 1655753,
    "isCapital": true,
    "populationRank": 138
  }, {
    "city": "Pretoria",
    "country": "South Africa",
    "continent": "Africa",
    "lat": -25.745,
    "population": 1619438,
    "isCapital": true,
    "populationRank": 141
  }, {
    "city": "Harare",
    "country": "Zimbabwe",
    "continent": "Africa",
    "lat": -17.828,
    "population": 1542813,
    "isCapital": true,
    "populationRank": 151
  }, {
    "city": "Antananarivo",
    "country": "Madagascar",
    "continent": "Africa",
    "lat": -18.914,
    "population": 1391433,
    "isCapital": true,
    "populationRank": 180
  }, {
    "city": "Kampala",
    "country": "Uganda",
    "continent": "Africa",
    "lat": 0.316,
    "population": 1353189,
    "isCapital": true,
    "populationRank": 190
  }, {
    "city": "Bamako",
    "country": "Mali",
    "continent": "Africa",
    "lat": 12.65,
    "population": 1297281,
    "isCapital": true,
    "populationRank": 200
  }, {
    "city": "Brazzaville",
    "country": "Republic of the Congo",
    "continent": "Africa",
    "lat": -4.266,
    "population": 1284609,
    "isCapital": true,
    "populationRank": 202
  }, {
    "city": "Lusaka",
    "country": "Zambia",
    "continent": "Africa",
    "lat": -15.407,
    "population": 1267440,
    "isCapital": true,
    "populationRank": 208
  }, {
    "city": "Maputo",
    "country": "Mozambique",
    "continent": "Africa",
    "lat": -25.966,
    "population": 1191613,
    "isCapital": true,
    "populationRank": 226
  }, {
    "city": "Tripoli",
    "country": "Libya",
    "continent": "Africa",
    "lat": 32.875,
    "population": 1150989,
    "isCapital": true,
    "populationRank": 232
  }, {
    "city": "Ouagadougou",
    "country": "Burkina Faso",
    "continent": "Africa",
    "lat": 12.366,
    "population": 1086505,
    "isCapital": true,
    "populationRank": 243
  }, {
    "city": "Monrovia",
    "country": "Liberia",
    "continent": "Africa",
    "lat": 6.301,
    "population": 939524,
    "isCapital": true,
    "populationRank": 268
  }, {
    "city": "Freetown",
    "country": "Sierra Leone",
    "continent": "Africa",
    "lat": 8.484,
    "population": 802639,
    "isCapital": true,
    "populationRank": 298
  }, {
    "city": "Niamey",
    "country": "Niger",
    "continent": "Africa",
    "lat": 13.514,
    "population": 774235,
    "isCapital": true,
    "populationRank": 314
  }, {
    "city": "Kigali",
    "country": "Rwanda",
    "continent": "Africa",
    "lat": -1.95,
    "population": 745261,
    "isCapital": true,
    "populationRank": 326
  }, {
    "city": "N'Djamena",
    "country": "Chad",
    "continent": "Africa",
    "lat": 12.107,
    "population": 721081,
    "isCapital": true,
    "populationRank": 335
  }, {
    "city": "Nouakchott",
    "country": "Mauritania",
    "continent": "Africa",
    "lat": 18.086,
    "population": 661400,
    "isCapital": true,
    "populationRank": 356
  }, {
    "city": "Lilongwe",
    "country": "Malawi",
    "continent": "Africa",
    "lat": -13.967,
    "population": 646750,
    "isCapital": true,
    "populationRank": 363
  }, {
    "city": "Djibouti",
    "country": "Djibouti",
    "continent": "Africa",
    "lat": 11.589,
    "population": 623891,
    "isCapital": true,
    "populationRank": 372
  }, {
    "city": "Libreville",
    "country": "Gabon",
    "continent": "Africa",
    "lat": 0.392,
    "population": 578156,
    "isCapital": true,
    "populationRank": 392
  }, {
    "city": "Asmara",
    "country": "Eritrea",
    "continent": "Africa",
    "lat": 15.338,
    "population": 563930,
    "isCapital": true,
    "populationRank": 400
  }, {
    "city": "Bangui",
    "country": "Central African Republic",
    "continent": "Africa",
    "lat": 4.361,
    "population": 542393,
    "isCapital": true,
    "populationRank": 412
  }, {
    "city": "Bissau",
    "country": "Guinea-Bissau",
    "continent": "Africa",
    "lat": 11.864,
    "population": 388028,
    "isCapital": true,
    "populationRank": 509
  }, {
    "city": "Bujumbura",
    "country": "Burundi",
    "continent": "Africa",
    "lat": -3.382,
    "population": 331700,
    "isCapital": true,
    "populationRank": 558
  }, {
    "city": "Juba",
    "country": "South Sudan",
    "continent": "Africa",
    "lat": 4.852,
    "population": 300000,
    "isCapital": true,
    "populationRank": 592
  }, {
    "city": "Windhoek",
    "country": "Namibia",
    "continent": "Africa",
    "lat": -22.559,
    "population": 268132,
    "isCapital": true,
    "populationRank": 625
  }, {
    "city": "Porto-Novo",
    "country": "Benin",
    "continent": "Africa",
    "lat": 6.496,
    "population": 234168,
    "isCapital": true,
    "populationRank": 667
  }, {
    "city": "Gaborone",
    "country": "Botswana",
    "continent": "Africa",
    "lat": -24.655,
    "population": 208411,
    "isCapital": true,
    "populationRank": 718
  }, {
    "city": "Yamoussoukro",
    "country": "Ivory Coast",
    "continent": "Africa",
    "lat": 6.821,
    "population": 194530,
    "isCapital": true,
    "populationRank": 747
  }, {
    "city": "Dodoma",
    "country": "Tanzania",
    "continent": "Africa",
    "lat": -6.172,
    "population": 180541,
    "isCapital": true,
    "populationRank": 773
  }, {
    "city": "Malabo",
    "country": "Equatorial Guinea",
    "continent": "Africa",
    "lat": 3.75,
    "population": 155963,
    "isCapital": true,
    "populationRank": 839
  }, {
    "city": "Port Louis",
    "country": "Mauritius",
    "continent": "Africa",
    "lat": -20.162,
    "population": 155226,
    "isCapital": true,
    "populationRank": 842
  }, {
    "city": "Saint-Denis",
    "country": "Réunion",
    "continent": "Africa",
    "lat": -20.882,
    "population": 137195,
    "isCapital": true,
    "populationRank": 889
  }, {
    "city": "Maseru",
    "country": "Lesotho",
    "continent": "Africa",
    "lat": -29.317,
    "population": 118355,
    "isCapital": true,
    "populationRank": 957
  }, {
    "city": "Praia",
    "country": "Cape Verde",
    "continent": "Africa",
    "lat": 14.932,
    "population": 113364,
    "isCapital": true,
    "populationRank": 978
  }, {
    "city": "Saint-Pierre",
    "country": "Réunion",
    "continent": "Africa",
    "lat": -21.339,
    "population": 76655,
    "isCapital": true,
    "populationRank": 1158
  }, {
    "city": "Mbabane",
    "country": "Swaziland",
    "continent": "Africa",
    "lat": -26.317,
    "population": 76218,
    "isCapital": true,
    "populationRank": 1164
  }, {
    "city": "Mamoudzou",
    "country": "Mayotte",
    "continent": "Africa",
    "lat": -12.782,
    "population": 54831,
    "isCapital": true,
    "populationRank": 1295
  }, {
    "city": "Moroni",
    "country": "Comoros",
    "continent": "Africa",
    "lat": -11.702,
    "population": 42872,
    "isCapital": true,
    "populationRank": 1379
  }, {
    "city": "Banjul",
    "country": "Gambia",
    "continent": "Africa",
    "lat": 13.453,
    "population": 34589,
    "isCapital": true,
    "populationRank": 1448
  }, {
    "city": "Victoria",
    "country": "Seychelles",
    "continent": "Africa",
    "lat": -4.617,
    "population": 22881,
    "isCapital": true,
    "populationRank": 1567
  }],
  "latRange": [37.346983, -34.854167]
}, {
  "continent": "Europe",
  "cities": [{
    "city": "Moscow",
    "country": "Russia",
    "continent": "Europe",
    "lat": 55.752,
    "population": 10381222,
    "isCapital": true,
    "populationRank": 11
  }, {
    "city": "London",
    "country": "United Kingdom",
    "continent": "Europe",
    "lat": 51.509,
    "population": 7556900,
    "isCapital": true,
    "populationRank": 28
  }, {
    "city": "Saint Petersburg",
    "country": "Russia",
    "continent": "Europe",
    "lat": 59.939,
    "population": 5028000,
    "isCapital": false,
    "populationRank": 39
  }, {
    "city": "Berlin",
    "country": "Germany",
    "continent": "Europe",
    "lat": 52.524,
    "population": 3426354,
    "isCapital": true,
    "populationRank": 61
  }, {
    "city": "Madrid",
    "country": "Spain",
    "continent": "Europe",
    "lat": 40.417,
    "population": 3255944,
    "isCapital": true,
    "populationRank": 62
  }, {
    "city": "Kiev",
    "country": "Ukraine",
    "continent": "Europe",
    "lat": 50.455,
    "population": 2797553,
    "isCapital": true,
    "populationRank": 72
  }, {
    "city": "Rome",
    "country": "Italy",
    "continent": "Europe",
    "lat": 41.892,
    "population": 2318895,
    "isCapital": true,
    "populationRank": 94
  }, {
    "city": "Paris",
    "country": "France",
    "continent": "Europe",
    "lat": 48.853,
    "population": 2138551,
    "isCapital": true,
    "populationRank": 104
  }, {
    "city": "Bucharest",
    "country": "Romania",
    "continent": "Europe",
    "lat": 44.432,
    "population": 1877155,
    "isCapital": true,
    "populationRank": 121
  }, {
    "city": "Budapest",
    "country": "Hungary",
    "continent": "Europe",
    "lat": 47.498,
    "population": 1741041,
    "isCapital": true,
    "populationRank": 130
  }, {
    "city": "Warsaw",
    "country": "Poland",
    "continent": "Europe",
    "lat": 52.23,
    "population": 1702139,
    "isCapital": true,
    "populationRank": 134
  }, {
    "city": "Belgrade",
    "country": "Serbia",
    "continent": "Europe",
    "lat": 44.804,
    "population": 1273651,
    "isCapital": true,
    "populationRank": 206
  }, {
    "city": "Stockholm",
    "country": "Sweden",
    "continent": "Europe",
    "lat": 59.333,
    "population": 1253309,
    "isCapital": true,
    "populationRank": 210
  }, {
    "city": "Prague",
    "country": "Czech Republic",
    "continent": "Europe",
    "lat": 50.088,
    "population": 1165581,
    "isCapital": true,
    "populationRank": 229
  }, {
    "city": "Copenhagen",
    "country": "Denmark",
    "continent": "Europe",
    "lat": 55.676,
    "population": 1153615,
    "isCapital": true,
    "populationRank": 230
  }, {
    "city": "Dublin",
    "country": "Ireland",
    "continent": "Europe",
    "lat": 53.333,
    "population": 1024027,
    "isCapital": true,
    "populationRank": 253
  }, {
    "city": "Riga",
    "country": "Latvia",
    "continent": "Europe",
    "lat": 56.946,
    "population": 742572,
    "isCapital": true,
    "populationRank": 327
  }, {
    "city": "Amsterdam",
    "country": "Netherlands",
    "continent": "Europe",
    "lat": 52.374,
    "population": 741636,
    "isCapital": true,
    "populationRank": 328
  }, {
    "city": "Athens",
    "country": "Greece",
    "continent": "Europe",
    "lat": 37.979,
    "population": 664046,
    "isCapital": true,
    "populationRank": 355
  }, {
    "city": "Oslo",
    "country": "Norway",
    "continent": "Europe",
    "lat": 59.913,
    "population": 580000,
    "isCapital": true,
    "populationRank": 391
  }, {
    "city": "Vilnius",
    "country": "Lithuania",
    "continent": "Europe",
    "lat": 54.689,
    "population": 542366,
    "isCapital": true,
    "populationRank": 413
  }, {
    "city": "Lisbon",
    "country": "Portugal",
    "continent": "Europe",
    "lat": 38.717,
    "population": 517802,
    "isCapital": true,
    "populationRank": 423
  }, {
    "city": "Bratislava",
    "country": "Slovakia",
    "continent": "Europe",
    "lat": 48.148,
    "population": 423737,
    "isCapital": true,
    "populationRank": 471
  }, {
    "city": "Reykjavik",
    "country": "Iceland",
    "continent": "Europe",
    "lat": 64.135,
    "population": 118918,
    "isCapital": true,
    "populationRank": 955
  }, {
    "city": "Luxembourg",
    "country": "Luxembourg",
    "continent": "Europe",
    "lat": 49.612,
    "population": 76684,
    "isCapital": true,
    "populationRank": 1157
  }, {
    "city": "Monaco",
    "country": "Monaco",
    "continent": "Europe",
    "lat": 43.733,
    "population": 32965,
    "isCapital": true,
    "populationRank": 1467
  }, {
    "city": "Minsk",
    "country": "Belarus",
    "continent": "Europe",
    "lat": 53.9,
    "population": 1742124,
    "isCapital": true,
    "populationRank": 129
  }, {
    "city": "Vienna",
    "country": "Austria",
    "continent": "Europe",
    "lat": 48.208,
    "population": 1691468,
    "isCapital": true,
    "populationRank": 137
  }, {
    "city": "Sofia",
    "country": "Bulgaria",
    "continent": "Europe",
    "lat": 42.698,
    "population": 1152556,
    "isCapital": true,
    "populationRank": 231
  }, {
    "city": "Brussels",
    "country": "Belgium",
    "continent": "Europe",
    "lat": 50.85,
    "population": 1019022,
    "isCapital": true,
    "populationRank": 255
  }, {
    "city": "Zagreb",
    "country": "Croatia",
    "continent": "Europe",
    "lat": 45.814,
    "population": 698966,
    "isCapital": true,
    "populationRank": 343
  }, {
    "city": "Sarajevo",
    "country": "Bosnia and Herzegovina",
    "continent": "Europe",
    "lat": 43.849,
    "population": 696731,
    "isCapital": true,
    "populationRank": 345
  }, {
    "city": "Helsinki",
    "country": "Finland",
    "continent": "Europe",
    "lat": 60.17,
    "population": 558457,
    "isCapital": true,
    "populationRank": 402
  }, {
    "city": "Pristina",
    "country": "Kosovo",
    "continent": "Europe",
    "lat": 42.673,
    "population": 550000,
    "isCapital": true,
    "populationRank": 406
  }, {
    "city": "Skopje",
    "country": "Macedonia",
    "continent": "Europe",
    "lat": 41.996,
    "population": 474889,
    "isCapital": true,
    "populationRank": 440
  }, {
    "city": "Tallinn",
    "country": "Estonia",
    "continent": "Europe",
    "lat": 59.437,
    "population": 394024,
    "isCapital": true,
    "populationRank": 501
  }, {
    "city": "Tirana",
    "country": "Albania",
    "continent": "Europe",
    "lat": 41.328,
    "population": 374801,
    "isCapital": true,
    "populationRank": 519
  }, {
    "city": "Ljubljana",
    "country": "Slovenia",
    "continent": "Europe",
    "lat": 46.051,
    "population": 272220,
    "isCapital": true,
    "populationRank": 623
  }, {
    "city": "Nicosia",
    "country": "Cyprus",
    "continent": "Europe",
    "lat": 35.175,
    "population": 200452,
    "isCapital": true,
    "populationRank": 731
  }, {
    "city": "Podgorica",
    "country": "Montenegro",
    "continent": "Europe",
    "lat": 42.441,
    "population": 136473,
    "isCapital": true,
    "populationRank": 892
  }, {
    "city": "Saint Helier",
    "country": "Jersey",
    "continent": "Europe",
    "lat": 49.188,
    "population": 28000,
    "isCapital": true,
    "populationRank": 1501
  }, {
    "city": "Gibraltar",
    "country": "Gibraltar",
    "continent": "Europe",
    "lat": 36.145,
    "population": 26544,
    "isCapital": true,
    "populationRank": 1517
  }, {
    "city": "Douglas",
    "country": "Isle of Man",
    "continent": "Europe",
    "lat": 54.15,
    "population": 26218,
    "isCapital": true,
    "populationRank": 1524
  }, {
    "city": "St Peter Port",
    "country": "Guernsey",
    "continent": "Europe",
    "lat": 49.46,
    "population": 16488,
    "isCapital": true,
    "populationRank": 1656
  }],
  "latRange": [71.133889, 34.800556]
}, {
  "continent": "Asia",
  "cities": [{
    "city": "Shanghai",
    "country": "China",
    "continent": "Asia",
    "lat": 31.222,
    "population": 22315474,
    "isCapital": false,
    "populationRank": 1
  }, {
    "city": "Mumbai",
    "country": "India",
    "continent": "Asia",
    "lat": 19.073,
    "population": 12691836,
    "isCapital": false,
    "populationRank": 3
  }, {
    "city": "Beijing",
    "country": "China",
    "continent": "Asia",
    "lat": 39.907,
    "population": 11716620,
    "isCapital": true,
    "populationRank": 5
  }, {
    "city": "Karachi",
    "country": "Pakistan",
    "continent": "Asia",
    "lat": 24.906,
    "population": 11624219,
    "isCapital": false,
    "populationRank": 6
  }, {
    "city": "Istanbul",
    "country": "Turkey",
    "continent": "Asia",
    "lat": 41.014,
    "population": 11174257,
    "isCapital": false,
    "populationRank": 7
  }, {
    "city": "Tianjin",
    "country": "China",
    "continent": "Asia",
    "lat": 39.142,
    "population": 11090314,
    "isCapital": false,
    "populationRank": 8
  }, {
    "city": "Guangzhou",
    "country": "China",
    "continent": "Asia",
    "lat": 23.117,
    "population": 11071424,
    "isCapital": false,
    "populationRank": 9
  }, {
    "city": "Delhi",
    "country": "India",
    "continent": "Asia",
    "lat": 28.652,
    "population": 10927986,
    "isCapital": false,
    "populationRank": 10
  }, {
    "city": "Shenzhen",
    "country": "China",
    "continent": "Asia",
    "lat": 22.546,
    "population": 10358381,
    "isCapital": false,
    "populationRank": 12
  }, {
    "city": "Dhaka",
    "country": "Bangladesh",
    "continent": "Asia",
    "lat": 23.71,
    "population": 10356500,
    "isCapital": true,
    "populationRank": 13
  }, {
    "city": "Seoul",
    "country": "South Korea",
    "continent": "Asia",
    "lat": 37.566,
    "population": 10349312,
    "isCapital": true,
    "populationRank": 14
  }, {
    "city": "Wuhan",
    "country": "China",
    "continent": "Asia",
    "lat": 30.583,
    "population": 9785388,
    "isCapital": false,
    "populationRank": 16
  }, {
    "city": "Jakarta",
    "country": "Indonesia",
    "continent": "Asia",
    "lat": -6.215,
    "population": 8540121,
    "isCapital": true,
    "populationRank": 18
  }, {
    "city": "Tokyo",
    "country": "Japan",
    "continent": "Asia",
    "lat": 35.69,
    "population": 8336599,
    "isCapital": true,
    "populationRank": 19
  }, {
    "city": "Dongguan",
    "country": "China",
    "continent": "Asia",
    "lat": 23.018,
    "population": 8000000,
    "isCapital": false,
    "populationRank": 21
  }, {
    "city": "Taipei",
    "country": "Taiwan",
    "continent": "Asia",
    "lat": 25.048,
    "population": 7871900,
    "isCapital": true,
    "populationRank": 22
  }, {
    "city": "Chongqing",
    "country": "China",
    "continent": "Asia",
    "lat": 29.563,
    "population": 7457600,
    "isCapital": false,
    "populationRank": 29
  }, {
    "city": "Chengdu",
    "country": "China",
    "continent": "Asia",
    "lat": 30.667,
    "population": 7415590,
    "isCapital": false,
    "populationRank": 30
  }, {
    "city": "Baghdad",
    "country": "Iraq",
    "continent": "Asia",
    "lat": 33.341,
    "population": 7216000,
    "isCapital": true,
    "populationRank": 31
  }, {
    "city": "Nanjing",
    "country": "China",
    "continent": "Asia",
    "lat": 32.062,
    "population": 7165292,
    "isCapital": false,
    "populationRank": 32
  }, {
    "city": "Tehran",
    "country": "Iran",
    "continent": "Asia",
    "lat": 35.694,
    "population": 7153309,
    "isCapital": true,
    "populationRank": 33
  }, {
    "city": "Hong Kong",
    "country": "Hong Kong",
    "continent": "Asia",
    "lat": 22.286,
    "population": 7012738,
    "isCapital": true,
    "populationRank": 34
  }, {
    "city": "Lahore",
    "country": "Pakistan",
    "continent": "Asia",
    "lat": 31.55,
    "population": 6310888,
    "isCapital": false,
    "populationRank": 35
  }, {
    "city": "Bangkok",
    "country": "Thailand",
    "continent": "Asia",
    "lat": 13.754,
    "population": 5104476,
    "isCapital": true,
    "populationRank": 37
  }, {
    "city": "Bengaluru",
    "country": "India",
    "continent": "Asia",
    "lat": 12.972,
    "population": 5104047,
    "isCapital": false,
    "populationRank": 38
  }, {
    "city": "Kolkata",
    "country": "India",
    "continent": "Asia",
    "lat": 22.563,
    "population": 4631392,
    "isCapital": false,
    "populationRank": 41
  }, {
    "city": "Yangon",
    "country": "Myanmar [Burma]",
    "continent": "Asia",
    "lat": 16.805,
    "population": 4477638,
    "isCapital": false,
    "populationRank": 43
  }, {
    "city": "Chennai",
    "country": "India",
    "continent": "Asia",
    "lat": 13.088,
    "population": 4328063,
    "isCapital": false,
    "populationRank": 44
  }, {
    "city": "Riyadh",
    "country": "Saudi Arabia",
    "continent": "Asia",
    "lat": 24.688,
    "population": 4205961,
    "isCapital": true,
    "populationRank": 46
  }, {
    "city": "Chittagong",
    "country": "Bangladesh",
    "continent": "Asia",
    "lat": 22.338,
    "population": 3920222,
    "isCapital": false,
    "populationRank": 47
  }, {
    "city": "Ahmedabad",
    "country": "India",
    "continent": "Asia",
    "lat": 23.026,
    "population": 3719710,
    "isCapital": false,
    "populationRank": 50
  }, {
    "city": "Busan",
    "country": "South Korea",
    "continent": "Asia",
    "lat": 35.103,
    "population": 3678555,
    "isCapital": false,
    "populationRank": 51
  }, {
    "city": "Hyderabad",
    "country": "India",
    "continent": "Asia",
    "lat": 17.384,
    "population": 3597816,
    "isCapital": false,
    "populationRank": 54
  }, {
    "city": "Yokohama",
    "country": "Japan",
    "continent": "Asia",
    "lat": 35.433,
    "population": 3574443,
    "isCapital": false,
    "populationRank": 55
  }, {
    "city": "Singapore",
    "country": "Singapore",
    "continent": "Asia",
    "lat": 1.29,
    "population": 3547809,
    "isCapital": true,
    "populationRank": 57
  }, {
    "city": "Ankara",
    "country": "Turkey",
    "continent": "Asia",
    "lat": 39.92,
    "population": 3517182,
    "isCapital": true,
    "populationRank": 58
  }, {
    "city": "Ho Chi Minh City",
    "country": "Vietnam",
    "continent": "Asia",
    "lat": 10.823,
    "population": 3467331,
    "isCapital": false,
    "populationRank": 59
  }, {
    "city": "Pyongyang",
    "country": "North Korea",
    "continent": "Asia",
    "lat": 39.034,
    "population": 3222000,
    "isCapital": true,
    "populationRank": 63
  }, {
    "city": "Kabul",
    "country": "Afghanistan",
    "continent": "Asia",
    "lat": 34.528,
    "population": 3043532,
    "isCapital": true,
    "populationRank": 66
  }, {
    "city": "Pune",
    "country": "India",
    "continent": "Asia",
    "lat": 18.52,
    "population": 2935744,
    "isCapital": false,
    "populationRank": 68
  }, {
    "city": "Surat",
    "country": "India",
    "continent": "Asia",
    "lat": 21.196,
    "population": 2894504,
    "isCapital": false,
    "populationRank": 69
  }, {
    "city": "Jeddah",
    "country": "Saudi Arabia",
    "continent": "Asia",
    "lat": 21.542,
    "population": 2867446,
    "isCapital": false,
    "populationRank": 70
  }, {
    "city": "Kanpur",
    "country": "India",
    "continent": "Asia",
    "lat": 26.465,
    "population": 2823249,
    "isCapital": false,
    "populationRank": 71
  }, {
    "city": "Quezon City",
    "country": "Philippines",
    "continent": "Asia",
    "lat": 14.649,
    "population": 2761720,
    "isCapital": false,
    "populationRank": 74
  }, {
    "city": "Incheon",
    "country": "South Korea",
    "continent": "Asia",
    "lat": 37.456,
    "population": 2628000,
    "isCapital": false,
    "populationRank": 80
  }, {
    "city": "Basra",
    "country": "Iraq",
    "continent": "Asia",
    "lat": 30.509,
    "population": 2600000,
    "isCapital": false,
    "populationRank": 82
  }, {
    "city": "Osaka",
    "country": "Japan",
    "continent": "Asia",
    "lat": 34.694,
    "population": 2592413,
    "isCapital": false,
    "populationRank": 83
  }, {
    "city": "Daegu",
    "country": "South Korea",
    "continent": "Asia",
    "lat": 35.87,
    "population": 2566540,
    "isCapital": false,
    "populationRank": 85
  }, {
    "city": "Faisalabad",
    "country": "Pakistan",
    "continent": "Asia",
    "lat": 31.417,
    "population": 2506595,
    "isCapital": false,
    "populationRank": 86
  }, {
    "city": "Izmir",
    "country": "Turkey",
    "continent": "Asia",
    "lat": 38.413,
    "population": 2500603,
    "isCapital": false,
    "populationRank": 87
  }, {
    "city": "Surabaya",
    "country": "Indonesia",
    "continent": "Asia",
    "lat": -7.249,
    "population": 2374658,
    "isCapital": false,
    "populationRank": 92
  }, {
    "city": "Mashhad",
    "country": "Iran",
    "continent": "Asia",
    "lat": 36.316,
    "population": 2307177,
    "isCapital": false,
    "populationRank": 95
  }, {
    "city": "Beirut",
    "country": "Lebanon",
    "continent": "Asia",
    "lat": 33.889,
    "population": 1916100,
    "isCapital": true,
    "populationRank": 118
  }, {
    "city": "Damascus",
    "country": "Syria",
    "continent": "Asia",
    "lat": 33.51,
    "population": 1569394,
    "isCapital": true,
    "populationRank": 149
  }, {
    "city": "Kuala Lumpur",
    "country": "Malaysia",
    "continent": "Asia",
    "lat": 3.141,
    "population": 1453975,
    "isCapital": true,
    "populationRank": 164
  }, {
    "city": "Hanoi",
    "country": "Vietnam",
    "continent": "Asia",
    "lat": 21.025,
    "population": 1431270,
    "isCapital": true,
    "populationRank": 170
  }, {
    "city": "Jerusalem",
    "country": "Israel",
    "continent": "Asia",
    "lat": 31.769,
    "population": 801000,
    "isCapital": true,
    "populationRank": 300
  }, {
    "city": "East Jerusalem",
    "country": "Palestine",
    "continent": "Asia",
    "lat": 31.783,
    "population": 428304,
    "isCapital": true,
    "populationRank": 469
  }, {
    "city": "Doha",
    "country": "Qatar",
    "continent": "Asia",
    "lat": 25.279,
    "population": 344939,
    "isCapital": true,
    "populationRank": 545
  }, {
    "city": "Tashkent",
    "country": "Uzbekistan",
    "continent": "Asia",
    "lat": 41.265,
    "population": 1978028,
    "isCapital": true,
    "populationRank": 112
  }, {
    "city": "Sanaa",
    "country": "Yemen",
    "continent": "Asia",
    "lat": 15.355,
    "population": 1937451,
    "isCapital": true,
    "populationRank": 117
  }, {
    "city": "Manila",
    "country": "Philippines",
    "continent": "Asia",
    "lat": 14.604,
    "population": 1600000,
    "isCapital": true,
    "populationRank": 144
  }, {
    "city": "Phnom Penh",
    "country": "Cambodia",
    "continent": "Asia",
    "lat": 11.562,
    "population": 1573544,
    "isCapital": true,
    "populationRank": 148
  }, {
    "city": "Kathmandu",
    "country": "Nepal",
    "continent": "Asia",
    "lat": 27.702,
    "population": 1442271,
    "isCapital": true,
    "populationRank": 167
  }, {
    "city": "Amman",
    "country": "Jordan",
    "continent": "Asia",
    "lat": 31.955,
    "population": 1275857,
    "isCapital": true,
    "populationRank": 204
  }, {
    "city": "Baku",
    "country": "Azerbaijan",
    "continent": "Asia",
    "lat": 40.378,
    "population": 1116513,
    "isCapital": true,
    "populationRank": 239
  }, {
    "city": "Yerevan",
    "country": "Armenia",
    "continent": "Asia",
    "lat": 40.181,
    "population": 1093485,
    "isCapital": true,
    "populationRank": 242
  }, {
    "city": "Tbilisi",
    "country": "Georgia",
    "continent": "Asia",
    "lat": 41.694,
    "population": 1049498,
    "isCapital": true,
    "populationRank": 248
  }, {
    "city": "Bishkek",
    "country": "Kyrgyzstan",
    "continent": "Asia",
    "lat": 42.87,
    "population": 900000,
    "isCapital": true,
    "populationRank": 277
  }, {
    "city": "Ulan Bator",
    "country": "Mongolia",
    "continent": "Asia",
    "lat": 47.908,
    "population": 844818,
    "isCapital": true,
    "populationRank": 286
  }, {
    "city": "Muscat",
    "country": "Oman",
    "continent": "Asia",
    "lat": 23.584,
    "population": 797000,
    "isCapital": true,
    "populationRank": 304
  }, {
    "city": "Ashgabat",
    "country": "Turkmenistan",
    "continent": "Asia",
    "lat": 37.95,
    "population": 727700,
    "isCapital": true,
    "populationRank": 330
  }, {
    "city": "Dushanbe",
    "country": "Tajikistan",
    "continent": "Asia",
    "lat": 38.536,
    "population": 679400,
    "isCapital": true,
    "populationRank": 350
  }, {
    "city": "Colombo",
    "country": "Sri Lanka",
    "continent": "Asia",
    "lat": 6.932,
    "population": 648034,
    "isCapital": true,
    "populationRank": 362
  }, {
    "city": "Abu Dhabi",
    "country": "United Arab Emirates",
    "continent": "Asia",
    "lat": 24.467,
    "population": 603492,
    "isCapital": true,
    "populationRank": 378
  }, {
    "city": "Macao",
    "country": "Macao",
    "continent": "Asia",
    "lat": 22.201,
    "population": 520400,
    "isCapital": true,
    "populationRank": 421
  }, {
    "city": "Astana",
    "country": "Kazakhstan",
    "continent": "Asia",
    "lat": 51.18,
    "population": 345604,
    "isCapital": true,
    "populationRank": 542
  }, {
    "city": "Tripoli",
    "country": "Lebanon",
    "continent": "Asia",
    "lat": 34.437,
    "population": 229398,
    "isCapital": true,
    "populationRank": 674
  }, {
    "city": "Vientiane",
    "country": "Laos",
    "continent": "Asia",
    "lat": 17.967,
    "population": 196731,
    "isCapital": true,
    "populationRank": 744
  }, {
    "city": "Manama",
    "country": "Bahrain",
    "continent": "Asia",
    "lat": 26.228,
    "population": 147074,
    "isCapital": true,
    "populationRank": 859
  }, {
    "city": "Thimphu",
    "country": "Bhutan",
    "continent": "Asia",
    "lat": 27.466,
    "population": 98676,
    "isCapital": true,
    "populationRank": 1034
  }, {
    "city": "Bandar Seri Begawan",
    "country": "Brunei",
    "continent": "Asia",
    "lat": 4.94,
    "population": 64409,
    "isCapital": true,
    "populationRank": 1230
  }, {
    "city": "Kuwait City",
    "country": "Kuwait",
    "continent": "Asia",
    "lat": 29.37,
    "population": 60064,
    "isCapital": true,
    "populationRank": 1257
  }],
  "latRange": [77.733333, -11]
}, {
  "continent": "Oceania",
  "cities": [{
    "city": "Sydney",
    "country": "Australia",
    "continent": "Oceania",
    "lat": -33.868,
    "population": 4627345,
    "isCapital": false,
    "populationRank": 42
  }, {
    "city": "Melbourne",
    "country": "Australia",
    "continent": "Oceania",
    "lat": -37.814,
    "population": 4246375,
    "isCapital": false,
    "populationRank": 45
  }, {
    "city": "Wellington",
    "country": "New Zealand",
    "continent": "Oceania",
    "lat": -41.287,
    "population": 381900,
    "isCapital": true,
    "populationRank": 516
  }, {
    "city": "Canberra",
    "country": "Australia",
    "continent": "Oceania",
    "lat": -35.283,
    "population": 367752,
    "isCapital": true,
    "populationRank": 525
  }, {
    "city": "Port Moresby",
    "country": "Papua New Guinea",
    "continent": "Oceania",
    "lat": -9.443,
    "population": 283733,
    "isCapital": true,
    "populationRank": 606
  }, {
    "city": "Hamilton",
    "country": "New Zealand",
    "continent": "Oceania",
    "lat": -37.783,
    "population": 152641,
    "isCapital": true,
    "populationRank": 848
  }, {
    "city": "Dili",
    "country": "East Timor",
    "continent": "Oceania",
    "lat": -8.559,
    "population": 150000,
    "isCapital": true,
    "populationRank": 853
  }, {
    "city": "Noumea",
    "country": "New Caledonia",
    "continent": "Oceania",
    "lat": -22.276,
    "population": 93060,
    "isCapital": true,
    "populationRank": 1063
  }, {
    "city": "Suva",
    "country": "Fiji",
    "continent": "Oceania",
    "lat": -18.142,
    "population": 77366,
    "isCapital": true,
    "populationRank": 1153
  }, {
    "city": "Honiara",
    "country": "Solomon Islands",
    "continent": "Oceania",
    "lat": -9.433,
    "population": 56298,
    "isCapital": true,
    "populationRank": 1282
  }, {
    "city": "Saipan",
    "country": "Northern Mariana Islands",
    "continent": "Oceania",
    "lat": 15.212,
    "population": 48220,
    "isCapital": true,
    "populationRank": 1337
  }, {
    "city": "Apia",
    "country": "Samoa",
    "continent": "Oceania",
    "lat": -13.833,
    "population": 40407,
    "isCapital": true,
    "populationRank": 1395
  }, {
    "city": "Tarawa",
    "country": "Kiribati",
    "continent": "Oceania",
    "lat": 1.328,
    "population": 40311,
    "isCapital": true,
    "populationRank": 1399
  }, {
    "city": "Port Vila",
    "country": "Vanuatu",
    "continent": "Oceania",
    "lat": -17.734,
    "population": 35901,
    "isCapital": true,
    "populationRank": 1437
  }, {
    "city": "Papeete",
    "country": "French Polynesia",
    "continent": "Oceania",
    "lat": -17.537,
    "population": 26357,
    "isCapital": true,
    "populationRank": 1519
  }, {
    "city": "Majuro",
    "country": "Marshall Islands",
    "continent": "Oceania",
    "lat": 7.09,
    "population": 25400,
    "isCapital": true,
    "populationRank": 1534
  }, {
    "city": "Nuku'alofa",
    "country": "Tonga",
    "continent": "Oceania",
    "lat": -21.139,
    "population": 22400,
    "isCapital": true,
    "populationRank": 1575
  }, {
    "city": "San Jose",
    "country": "Northern Mariana Islands",
    "continent": "Oceania",
    "lat": 14.968,
    "population": 15000,
    "isCapital": true,
    "populationRank": 1679
  }, {
    "city": "Avarua",
    "country": "Cook Islands",
    "continent": "Oceania",
    "lat": -21.208,
    "population": 13373,
    "isCapital": true,
    "populationRank": 1702
  }, {
    "city": "Pago Pago",
    "country": "American Samoa",
    "continent": "Oceania",
    "lat": -14.278,
    "population": 11500,
    "isCapital": true,
    "populationRank": 1725
  }],
  "latRange": [28.416667, -52.616667]
}];
draw(data);
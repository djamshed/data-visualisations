
    // global flags: sortBy and activeTeam
    var sortBy = 'opponents';
    var activeTeam = '';
    // formatters
    var diffFormatter = d3.format('+.0f');
    var getOrdinal = (n) => {
      var s=["th","st","nd","rd"], v=n%100;
      return n+(s[(v-20)%10]||s[v]||s[0]);
    };

    // details section updater
    var updateDetails = d => {
      d3.select('.chart')
        .selectAll('.team__label')
        .classed('active', false)
        .filter(t => t.opponent === d.team || t.team === d.team)
        .classed('active', true)
      ;
      activeTeam = d.team;
      var info =
        '<div style="font-size: 28px;">' + d.team + '</div>' +
        '<div style="margin: 5px 0;">Ranked <strong>' + getOrdinal(d.uefaRank) + '</strong> by UEFA, the team finished ' +
        '<strong>' + getOrdinal(d.groupStanding) + '</strong> in group ' +
        '<strong>' + d.group + '</strong> with ' +
        '<strong>' + d.pts + '</strong> points and ' +
        '<strong>' + diffFormatter(d.goalDiff) + '</strong> goal differential.</div>'
      ;
      var status = d.isOut ?
        '<div>' + d.team + ' is <strong>out of the competition</strong>.</div>'  :
        '<div>' + d.team + ' has <strong>has advanced to Round of 16</strong>.</div>'
      ;
      var games =
        '<div style="margin: 5px 0;"></div>'+
        '<div><strong>Matches</strong>:</div>'+
          '<div>' + d.opponents.map( opp => opp.gameText ).join('</div><div>') + '</div>'+
        '</div>';

      d3.select('.team-details').html(info + status + games);
    }

    // draws teams and opponents
    var drawChart = (data) => {
      var widthScale = d3.scale.linear()
                      .domain(d3.extent(teams, d => d.uefaCoeff))
                      .range([70, 200])
      ;

      // show/hide relevant content
      if (sortBy === 'groups') {
        d3.selectAll('.sort-by-groups-description').style('display', 'table-cell');
        d3.selectAll('.sort-by-opponents-description').style('display', 'none');
      }
      else {
        d3.selectAll('.sort-by-opponents-description').style('display', 'table-cell');
        d3.selectAll('.sort-by-groups-description').style('display', 'none');
      }
      // one row per team
      var teamEnter = d3.select('.chart')
        .selectAll('.team').data(data)
        .enter()
          .append('div')
          .attr('class', 'team')
      ;
      d3.select('.chart')
        .selectAll('.team').data(data)
        .classed('team--out', d => d.isOut)
      ;
      // enter team name
      teamEnter
        .append('div')
        .attr('class', 'team__label team__lead')
        .on('mouseover', updateDetails)
      ;
      // update team name
      d3.select('.chart').selectAll('.team__lead').data(data)
        .style('margin-bottom', d => sortBy === 'groups' && d.groupStanding === 4 ? '30px' : '0')
        .attr('title', d => d.team + ' UEFA coefficient: ' + d.uefaCoeff + ' (' + getOrdinal(d.uefaRank) +')')
        .classed('active', d => d.team === activeTeam)
        .text(d => {console.log(d.team); return d.team})

      // enter oppponents
      teamEnter
        .append('div')
        .style('display', 'inline-block')
        .attr('class', 'team__opponents')
          .selectAll('.opponent').data(d => d.opponents)
          .enter()
            .append('div')
            .attr('class', 'opponent team__label')
      ;
      // update opponents
      d3.select('.chart').selectAll('.team')
        .selectAll('.team__opponents').data(d => [d])
        .selectAll('.opponent').data(d => d.opponents)
          .classed('tie', d => d.gameWinner === '')
          .classed('loss', d => d.gameWinner === d.opponent)
          .classed('win', d => d.gameWinner !== '' && d.gameWinner !== d.opponent)
          .style('width', d => widthScale(d.opponentUefaCoeff) + 'px')
          .classed('active', d => d.opponent === activeTeam)
          .attr('title',d => d.gameText)
          .text( d => d.opponent)
      ;
    }

    // add click handlers
    d3.selectAll('.sort-by')
      .on('mousedown', () => {
        var btn = d3.select(d3.event.target);
        if (btn.classed('sort-by--opponents')) {
          teams.sort( (a, b) => a.groupCoeff - b.groupCoeff);
        }
        else if (btn.classed('sort-by--group')) {
          teams.sort( (a, b) =>
      a.group === b.group ? a.groupStanding - b.groupStanding : a.group > b.group ? 1 : -1);
        }
        // activate button
        d3.selectAll('.sort-by').classed('active', false);
        btn.classed('active', true);
        sortBy = btn.text();
        // update chart
        drawChart(teams);
    });

    // data, derived from sources and some JS
    var teams = [{"team":"Germany","uefaRank":1,"uefaCoeff":40.236,"group":"C","groupRank":1,"groupStanding":1,"pts":7,"goalDiff":3,"isOut":false,"opponents":[{"opponent":"Ukraine","opponentUefaRank":14,"opponentUefaCoeff":30.313,"gameText":"Germany 2 - 0 Ukraine","gameWinner":"Germany"},{"opponent":"Poland","opponentUefaRank":17,"opponentUefaCoeff":28.306,"gameText":"Germany 0 - 0 Poland","gameWinner":""},{"opponent":"N. Ireland","opponentUefaRank":33,"opponentUefaCoeff":22.961,"gameText":"N. Ireland 0 - 1 Germany","gameWinner":"Germany"}],"groupCoeff":81.58},{"team":"France","uefaRank":8,"uefaCoeff":33.599,"group":"A","groupRank":1,"groupStanding":1,"pts":7,"goalDiff":3,"isOut":false,"opponents":[{"opponent":"Switzerland","opponentUefaRank":10,"opponentUefaCoeff":31.254,"gameText":"Switzerland 0 - 0 France","gameWinner":""},{"opponent":"Romania","opponentUefaRank":18,"opponentUefaCoeff":28.038,"gameText":"France 2 - 1 Romania","gameWinner":"France"},{"opponent":"Albania","opponentUefaRank":31,"opponentUefaCoeff":23.216,"gameText":"France 2 - 0 Albania","gameWinner":"France"}],"groupCoeff":82.50800000000001},{"team":"England","uefaRank":3,"uefaCoeff":35.963,"group":"B","groupRank":1,"groupStanding":2,"pts":5,"goalDiff":1,"isOut":false,"opponents":[{"opponent":"Russia","opponentUefaRank":9,"opponentUefaCoeff":31.345,"gameText":"England 1 - 1 Russia","gameWinner":""},{"opponent":"Slovakia","opponentUefaRank":19,"opponentUefaCoeff":27.171,"gameText":"Slovakia 0 - 0 England","gameWinner":""},{"opponent":"Wales","opponentUefaRank":28,"opponentUefaCoeff":24.531,"gameText":"England 2 - 1 Wales","gameWinner":"England"}],"groupCoeff":83.047},{"team":"Portugal","uefaRank":4,"uefaCoeff":35.138,"group":"F","groupRank":1,"groupStanding":3,"pts":3,"goalDiff":0,"isOut":false,"opponents":[{"opponent":"Austria","opponentUefaRank":11,"opponentUefaCoeff":30.932,"gameText":"Portugal 0 - 0 Austria","gameWinner":""},{"opponent":"Hungary","opponentUefaRank":20,"opponentUefaCoeff":27.142,"gameText":"Hungary 3 - 3 Portugal","gameWinner":""},{"opponent":"Iceland","opponentUefaRank":27,"opponentUefaCoeff":25.388,"gameText":"Portugal 1 - 1 Iceland","gameWinner":""}],"groupCoeff":83.462},{"team":"Switzerland","uefaRank":10,"uefaCoeff":31.254,"group":"A","groupRank":2,"groupStanding":2,"pts":5,"goalDiff":1,"isOut":false,"opponents":[{"opponent":"France","opponentUefaRank":8,"opponentUefaCoeff":33.599,"gameText":"Switzerland 0 - 0 France","gameWinner":""},{"opponent":"Romania","opponentUefaRank":18,"opponentUefaCoeff":28.038,"gameText":"Romania 1 - 1 Switzerland","gameWinner":""},{"opponent":"Albania","opponentUefaRank":31,"opponentUefaCoeff":23.216,"gameText":"Albania 0 - 1 Switzerland","gameWinner":"Switzerland"}],"groupCoeff":84.85300000000001},{"team":"Spain","uefaRank":2,"uefaCoeff":37.962,"group":"D","groupRank":1,"groupStanding":2,"pts":6,"goalDiff":3,"isOut":false,"opponents":[{"opponent":"Croatia","opponentUefaRank":12,"opponentUefaCoeff":30.642,"gameText":"Croatia 2 - 1 Spain","gameWinner":"Croatia"},{"opponent":"Czech R.","opponentUefaRank":15,"opponentUefaCoeff":29.403,"gameText":"Spain 1 - 0 Czech R.","gameWinner":"Spain"},{"opponent":"Turkey","opponentUefaRank":22,"opponentUefaCoeff":27.033,"gameText":"Spain 3 - 0 Turkey","gameWinner":"Spain"}],"groupCoeff":87.078},{"team":"Russia","uefaRank":9,"uefaCoeff":31.345,"group":"B","groupRank":2,"groupStanding":4,"pts":1,"goalDiff":-4,"isOut":true,"opponents":[{"opponent":"England","opponentUefaRank":3,"opponentUefaCoeff":35.963,"gameText":"England 1 - 1 Russia","gameWinner":""},{"opponent":"Slovakia","opponentUefaRank":19,"opponentUefaCoeff":27.171,"gameText":"Russia 1 - 2 Slovakia","gameWinner":"Slovakia"},{"opponent":"Wales","opponentUefaRank":28,"opponentUefaCoeff":24.531,"gameText":"Russia 0 - 3 Wales","gameWinner":"Wales"}],"groupCoeff":87.66499999999999},{"team":"Austria","uefaRank":11,"uefaCoeff":30.932,"group":"F","groupRank":2,"groupStanding":4,"pts":1,"goalDiff":-3,"isOut":true,"opponents":[{"opponent":"Portugal","opponentUefaRank":4,"opponentUefaCoeff":35.138,"gameText":"Portugal 0 - 0 Austria","gameWinner":""},{"opponent":"Hungary","opponentUefaRank":20,"opponentUefaCoeff":27.142,"gameText":"Austria 0 - 2 Hungary","gameWinner":"Hungary"},{"opponent":"Iceland","opponentUefaRank":27,"opponentUefaCoeff":25.388,"gameText":"Iceland 2 - 1 Austria","gameWinner":"Iceland"}],"groupCoeff":87.668},{"team":"Romania","uefaRank":18,"uefaCoeff":28.038,"group":"A","groupRank":3,"groupStanding":4,"pts":3,"goalDiff":-2,"isOut":true,"opponents":[{"opponent":"France","opponentUefaRank":8,"opponentUefaCoeff":33.599,"gameText":"France 2 - 1 Romania","gameWinner":"France"},{"opponent":"Switzerland","opponentUefaRank":10,"opponentUefaCoeff":31.254,"gameText":"Romania 1 - 1 Switzerland","gameWinner":""},{"opponent":"Albania","opponentUefaRank":31,"opponentUefaCoeff":23.216,"gameText":"Romania 0 - 1 Albania","gameWinner":"Albania"}],"groupCoeff":88.06899999999999},{"team":"Belgium","uefaRank":5,"uefaCoeff":34.442,"group":"E","groupRank":1,"groupStanding":2,"pts":6,"goalDiff":2,"isOut":false,"opponents":[{"opponent":"Italy","opponentUefaRank":6,"opponentUefaCoeff":34.345,"gameText":"Belgium 0 - 2 Italy","gameWinner":"Italy"},{"opponent":"Sweden","opponentUefaRank":16,"opponentUefaCoeff":29.028,"gameText":"Sweden 0 - 1 Belgium","gameWinner":"Belgium"},{"opponent":"Ireland","opponentUefaRank":23,"opponentUefaCoeff":26.902,"gameText":"Belgium 3 - 0 Ireland","gameWinner":"Belgium"}],"groupCoeff":90.275},{"team":"Italy","uefaRank":6,"uefaCoeff":34.345,"group":"E","groupRank":2,"groupStanding":1,"pts":6,"goalDiff":2,"isOut":false,"opponents":[{"opponent":"Belgium","opponentUefaRank":5,"opponentUefaCoeff":34.442,"gameText":"Belgium 0 - 2 Italy","gameWinner":"Italy"},{"opponent":"Sweden","opponentUefaRank":16,"opponentUefaCoeff":29.028,"gameText":"Italy 1 - 0 Sweden","gameWinner":"Italy"},{"opponent":"Ireland","opponentUefaRank":23,"opponentUefaCoeff":26.902,"gameText":"Italy 0 - 1 Ireland","gameWinner":"Ireland"}],"groupCoeff":90.372},{"team":"Hungary","uefaRank":20,"uefaCoeff":27.142,"group":"F","groupRank":3,"groupStanding":1,"pts":5,"goalDiff":2,"isOut":false,"opponents":[{"opponent":"Portugal","opponentUefaRank":4,"opponentUefaCoeff":35.138,"gameText":"Hungary 3 - 3 Portugal","gameWinner":""},{"opponent":"Austria","opponentUefaRank":11,"opponentUefaCoeff":30.932,"gameText":"Austria 0 - 2 Hungary","gameWinner":"Hungary"},{"opponent":"Iceland","opponentUefaRank":27,"opponentUefaCoeff":25.388,"gameText":"Iceland 1 - 1 Hungary","gameWinner":""}],"groupCoeff":91.458},{"team":"Ukraine","uefaRank":14,"uefaCoeff":30.313,"group":"C","groupRank":2,"groupStanding":4,"pts":0,"goalDiff":-5,"isOut":true,"opponents":[{"opponent":"Germany","opponentUefaRank":1,"opponentUefaCoeff":40.236,"gameText":"Germany 2 - 0 Ukraine","gameWinner":"Germany"},{"opponent":"Poland","opponentUefaRank":17,"opponentUefaCoeff":28.306,"gameText":"Ukraine 0 - 1 Poland","gameWinner":"Poland"},{"opponent":"N. Ireland","opponentUefaRank":33,"opponentUefaCoeff":22.961,"gameText":"Ukraine 0 - 2 N. Ireland","gameWinner":"N. Ireland"}],"groupCoeff":91.503},{"team":"Slovakia","uefaRank":19,"uefaCoeff":27.171,"group":"B","groupRank":3,"groupStanding":3,"pts":4,"goalDiff":0,"isOut":false,"opponents":[{"opponent":"England","opponentUefaRank":3,"opponentUefaCoeff":35.963,"gameText":"Slovakia 0 - 0 England","gameWinner":""},{"opponent":"Russia","opponentUefaRank":9,"opponentUefaCoeff":31.345,"gameText":"Russia 1 - 2 Slovakia","gameWinner":"Slovakia"},{"opponent":"Wales","opponentUefaRank":28,"opponentUefaCoeff":24.531,"gameText":"Wales 2 - 1 Slovakia","gameWinner":"Wales"}],"groupCoeff":91.839},{"team":"Albania","uefaRank":31,"uefaCoeff":23.216,"group":"A","groupRank":4,"groupStanding":3,"pts":1,"goalDiff":-2,"isOut":true,"opponents":[{"opponent":"France","opponentUefaRank":8,"opponentUefaCoeff":33.599,"gameText":"France 2 - 0 Albania","gameWinner":"France"},{"opponent":"Switzerland","opponentUefaRank":10,"opponentUefaCoeff":31.254,"gameText":"Albania 0 - 1 Switzerland","gameWinner":"Switzerland"},{"opponent":"Romania","opponentUefaRank":18,"opponentUefaCoeff":28.038,"gameText":"Romania 0 - 1 Albania","gameWinner":"Albania"}],"groupCoeff":92.89099999999999},{"team":"Iceland","uefaRank":27,"uefaCoeff":25.388,"group":"F","groupRank":4,"groupStanding":2,"pts":5,"goalDiff":1,"isOut":false,"opponents":[{"opponent":"Portugal","opponentUefaRank":4,"opponentUefaCoeff":35.138,"gameText":"Portugal 1 - 1 Iceland","gameWinner":""},{"opponent":"Austria","opponentUefaRank":11,"opponentUefaCoeff":30.932,"gameText":"Iceland 2 - 1 Austria","gameWinner":"Iceland"},{"opponent":"Hungary","opponentUefaRank":20,"opponentUefaCoeff":27.142,"gameText":"Iceland 1 - 1 Hungary","gameWinner":""}],"groupCoeff":93.21199999999999},{"team":"Poland","uefaRank":17,"uefaCoeff":28.306,"group":"C","groupRank":3,"groupStanding":2,"pts":7,"goalDiff":2,"isOut":false,"opponents":[{"opponent":"Germany","opponentUefaRank":1,"opponentUefaCoeff":40.236,"gameText":"Germany 0 - 0 Poland","gameWinner":""},{"opponent":"Ukraine","opponentUefaRank":14,"opponentUefaCoeff":30.313,"gameText":"Ukraine 0 - 1 Poland","gameWinner":"Poland"},{"opponent":"N. Ireland","opponentUefaRank":33,"opponentUefaCoeff":22.961,"gameText":"Poland 1 - 0 N. Ireland","gameWinner":"Poland"}],"groupCoeff":93.50999999999999},{"team":"Croatia","uefaRank":12,"uefaCoeff":30.642,"group":"D","groupRank":2,"groupStanding":1,"pts":7,"goalDiff":2,"isOut":false,"opponents":[{"opponent":"Spain","opponentUefaRank":2,"opponentUefaCoeff":37.962,"gameText":"Croatia 2 - 1 Spain","gameWinner":"Croatia"},{"opponent":"Czech R.","opponentUefaRank":15,"opponentUefaCoeff":29.403,"gameText":"Czech R. 2 - 2 Croatia","gameWinner":""},{"opponent":"Turkey","opponentUefaRank":22,"opponentUefaCoeff":27.033,"gameText":"Turkey 0 - 1 Croatia","gameWinner":"Croatia"}],"groupCoeff":94.39800000000001},{"team":"Wales","uefaRank":28,"uefaCoeff":24.531,"group":"B","groupRank":4,"groupStanding":1,"pts":6,"goalDiff":3,"isOut":false,"opponents":[{"opponent":"England","opponentUefaRank":3,"opponentUefaCoeff":35.963,"gameText":"England 2 - 1 Wales","gameWinner":"England"},{"opponent":"Russia","opponentUefaRank":9,"opponentUefaCoeff":31.345,"gameText":"Russia 0 - 3 Wales","gameWinner":"Wales"},{"opponent":"Slovakia","opponentUefaRank":19,"opponentUefaCoeff":27.171,"gameText":"Wales 2 - 1 Slovakia","gameWinner":"Wales"}],"groupCoeff":94.47899999999998},{"team":"Czech R.","uefaRank":15,"uefaCoeff":29.403,"group":"D","groupRank":3,"groupStanding":4,"pts":1,"goalDiff":-3,"isOut":true,"opponents":[{"opponent":"Spain","opponentUefaRank":2,"opponentUefaCoeff":37.962,"gameText":"Spain 1 - 0 Czech R.","gameWinner":"Spain"},{"opponent":"Croatia","opponentUefaRank":12,"opponentUefaCoeff":30.642,"gameText":"Czech R. 2 - 2 Croatia","gameWinner":""},{"opponent":"Turkey","opponentUefaRank":22,"opponentUefaCoeff":27.033,"gameText":"Czech R. 0 - 2 Turkey","gameWinner":"Turkey"}],"groupCoeff":95.637},{"team":"Sweden","uefaRank":16,"uefaCoeff":29.028,"group":"E","groupRank":3,"groupStanding":4,"pts":1,"goalDiff":-2,"isOut":true,"opponents":[{"opponent":"Belgium","opponentUefaRank":5,"opponentUefaCoeff":34.442,"gameText":"Sweden 0 - 1 Belgium","gameWinner":"Belgium"},{"opponent":"Italy","opponentUefaRank":6,"opponentUefaCoeff":34.345,"gameText":"Italy 1 - 0 Sweden","gameWinner":"Italy"},{"opponent":"Ireland","opponentUefaRank":23,"opponentUefaCoeff":26.902,"gameText":"Ireland 1 - 1 Sweden","gameWinner":""}],"groupCoeff":95.68900000000001},{"team":"Ireland","uefaRank":23,"uefaCoeff":26.902,"group":"E","groupRank":4,"groupStanding":3,"pts":4,"goalDiff":-2,"isOut":false,"opponents":[{"opponent":"Belgium","opponentUefaRank":5,"opponentUefaCoeff":34.442,"gameText":"Belgium 3 - 0 Ireland","gameWinner":"Belgium"},{"opponent":"Italy","opponentUefaRank":6,"opponentUefaCoeff":34.345,"gameText":"Italy 0 - 1 Ireland","gameWinner":"Ireland"},{"opponent":"Sweden","opponentUefaRank":16,"opponentUefaCoeff":29.028,"gameText":"Ireland 1 - 1 Sweden","gameWinner":""}],"groupCoeff":97.815},{"team":"Turkey","uefaRank":22,"uefaCoeff":27.033,"group":"D","groupRank":4,"groupStanding":3,"pts":3,"goalDiff":-2,"isOut":true,"opponents":[{"opponent":"Spain","opponentUefaRank":2,"opponentUefaCoeff":37.962,"gameText":"Spain 3 - 0 Turkey","gameWinner":"Spain"},{"opponent":"Croatia","opponentUefaRank":12,"opponentUefaCoeff":30.642,"gameText":"Turkey 0 - 1 Croatia","gameWinner":"Croatia"},{"opponent":"Czech R.","opponentUefaRank":15,"opponentUefaCoeff":29.403,"gameText":"Czech R. 0 - 2 Turkey","gameWinner":"Turkey"}],"groupCoeff":98.007},{"team":"N. Ireland","uefaRank":33,"uefaCoeff":22.961,"group":"C","groupRank":4,"groupStanding":3,"pts":3,"goalDiff":0,"isOut":false,"opponents":[{"opponent":"Germany","opponentUefaRank":1,"opponentUefaCoeff":40.236,"gameText":"N. Ireland 0 - 1 Germany","gameWinner":"Germany"},{"opponent":"Ukraine","opponentUefaRank":14,"opponentUefaCoeff":30.313,"gameText":"Ukraine 0 - 2 N. Ireland","gameWinner":"N. Ireland"},{"opponent":"Poland","opponentUefaRank":17,"opponentUefaCoeff":28.306,"gameText":"Poland 1 - 0 N. Ireland","gameWinner":"Poland"}],"groupCoeff":98.85499999999999}];
    // draw chart
    drawChart(teams);
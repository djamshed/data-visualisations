// alt-golden-boots app file
// scrolly-tells the story using d3, scroll-graph


const randomSmall = d3.randomUniform(10, 20);
const random360 = d3.randomUniform(0,360);
const circle0 = d3.randomUniform(50, 90);
const circle1 = d3.randomUniform(110, 130);
const circle2 = d3.randomUniform(150, 170);

// ------- highlighted goal sizes
const REGULAR_SIZE = '5px';
const TIE_SIZE = '7px';
const WIN_SIZE = '10px';

// ------- containers
const teamsContainer = d3.select('.table-story .teams-container');
const goalsContainer = d3.select('.goal-story .goals-container');
const playersContainer = d3.select('.players-story .players-container');


// -------- data
let teamGoals, goalLeaders, teamStandings;

const start = () => {
  // load data
  d3.json('pl08-09.combined.json', function(error, data) {
    if(!error) {
      teamGoals = data.table;
      goalLeaders = data.leaders.map( d => Object.assign({id: d.playerID, label: d.player, goals_for: d.goals}, d));

      // remove "heavy" t.goals property before passing it to draw table
      teamStandings = teamGoals.map(t => Object.assign({id: t.team, label: t.team}, t, {goals: null}));
      drawTeams(teamStandings);

      // main data source has loaded, start scrolling
      graphscroll();
    }
    else {
      console.log('Error loading data');
    }
  });
}


// -------------------- util functions

const drawAllGoals = (data) => {
  const CENTER_WIDTH = 500/2;
  const CENTER_HEIGHT = 500/2;
  let teamRank = data.reduce( (aggr, team) => {
    aggr[team.team] = team.rank;
    return aggr;
  }, {});
  const initTranform = (d, i) => `rotate(0deg) translate(${i*5 -CENTER_WIDTH}px,${teamRank[d.team]*23 /* row height */ - CENTER_HEIGHT - 10 /* ughh, tweak :| */}px)`;
  const gcontainer = goalsContainer.selectAll('.goal-group').data(data);
  gcontainer
    .enter()
      .append('span')
      .attr('class', t => `animated goal-group goal-group--${t.rank}`)
      .style('animation-duration', () => randomSmall() + 's');
  const goal = goalsContainer.selectAll('.goal-group').selectAll('.goal').data(t => t.goals);
  goal
    .enter()
      .append('span')
      .attr('class', 'goal')
      .each( (d, i) => d._initialTransform = initTranform(d, i) ) // set initial transform/goal position
      .classed('goal--regular', d => d.goalPts === 0)
      .classed('goal--tying', d => d.goalPts === 1)
      .classed('goal--winning', d => d.goalPts === 3)
      .classed('goal--top-player', d => d.isTopPlayer)
      .classed('goal--not-top-player', d => !d.isTopPlayer)
    .merge(goal)
      .classed('highlighted', false)
      .style('width', REGULAR_SIZE)
      .style('height', REGULAR_SIZE)
  ;
}

const updateClassedLabel = (labelClass, label) => {
  const data = label ? [label] : [];
  const lbl = goalsContainer.selectAll('.'+labelClass).data(data);
  lbl
    .enter()
      .append('div')
      .attr('class', labelClass)
    .merge(lbl)
      .html(d => d);
  lbl.exit().remove();
}

const highlightGoals = (goals, circle, duration, delay, size) => {
  const extractRotate = t => t.substring(t.indexOf('rotate(') + 7, t.indexOf('deg)'));
  const rotateFx = (r, sel) => `rotate(${+extractRotate(sel.style('transform')) + r}deg)`
  const translateFx = tr => `translate(${tr()}px)`;

  if (!circle) circle = circle0;

  function transformGoal() {
    const sel = d3.select(this);
    return `${rotateFx(90, sel)} ${translateFx(circle)}`;
  }

  goals
    .interrupt()
    .transition()
    .duration(duration || 500)
    .delay(delay || 0)
    .style('width', size || REGULAR_SIZE)
    .style('height', size || REGULAR_SIZE)
    .style('transform', transformGoal)
  ;
}

// -------------------- /util functions



// -------------------- scroll step functions
const drawTeams = data => {
  const teamEnter = teamsContainer.selectAll('.team')
    .data(data)
  .enter()
    .append('div')
    .attr('class', 'team')
    .html(teamDescription);
}
const highlightTableRanks = () => {
  highlightTableItems('.text-rank');
}
const highlightTablePoints = () => {
  highlightTableItems('.text-points');
}
const highlightTableWinsTies = () => {
  highlightTableItems('.text-wins, .text-draws');
}
const highlightTableGoals = () => {
  highlightTableItems('.text-goals-for');
}
const highlightTableWinsPoints = () => {
  highlightTableItems('.text-points, .text-wins');
}
const highlightTableDrawPoints = () => {
  highlightTableItems('.text-points, .text-draws');
}
const highlightTableItems = (activeClass) => {
  teamsContainer.selectAll('*').classed('active-stat', false);
  teamsContainer.selectAll(activeClass).classed('active-stat', true);
}


const rotateAllGoals = () => {
  drawAllGoals(teamGoals);

  if (!isStepForward()) {
    // restore winning goals to their initial position (for scroll-up)
    highlightGoals(goalsContainer.selectAll('.goal--tying').classed('highlighted', false),
    circle0, 500, (d, i) => i * 5, REGULAR_SIZE);
  }
  else {
    goalsContainer.selectAll('.goal-group').selectAll('.goal')
      .style('transform', d => `rotate(${random360()}deg) translate(${circle0()}px)`)
  }
  // update legend/labels
  updateClassedLabel('goal-legend', '<span class="goal"></span> goal');
  updateClassedLabel('one-point-label');
}
const highlightTyingGoals = () => {
  if (!isStepForward()) {
    // restore winning goals to their initial position (for scroll-up)
    highlightGoals(goalsContainer.selectAll('.goal--winning').classed('highlighted', false),
    circle0, 500, (d, i) => i * 5, REGULAR_SIZE);
  }
  else {
    // highlight tying goals
    highlightGoals(
      goalsContainer.selectAll('.goal--tying').classed('highlighted', true),
      circle1, 750, (d, i) => i * 5, TIE_SIZE
    );
  }

  // update legend + labels
  updateClassedLabel('goal-legend',
      `<span class="goal goal--tying highlighted"></span> tying goal (1pt)
      <span class="vdivider"></span>
      <span class="goal"></span> goal
      `);
  updateClassedLabel('one-point-label', '1-point goals');
  updateClassedLabel('three-points-label');
};

const highlightWinningGoals = () => {
  // restore scroll-up
  if (!isStepForward()) {
    const transformFx = () => `rotate(${random360()}deg)`;

    // restore all goal positions
    goalsContainer
      .selectAll('.goal--regular, .goal--winning')
      .style('transform', d => `rotate(${random360()}deg) translate(${circle0()}px)`)
      .style('width', REGULAR_SIZE)
      .style('height', REGULAR_SIZE)
    ;
    goalsContainer
      .selectAll('.goal--tying')
      .classed('highlighted', true)
      .style('transform', d => `rotate(${random360()}deg) translate(${circle1()}px)`)
      .style('width', TIE_SIZE)
      .style('height', TIE_SIZE)
    ;
    // restart rotation
    goalsContainer.selectAll('.goal-group')
      .classed('animated', true);
  }

  // highlight winning goals
  highlightGoals(
    goalsContainer.selectAll('.goal--winning').classed('highlighted', true),
    circle2, 500, (d, i) => i * 5, WIN_SIZE
  );


  // update legend + labels
  updateClassedLabel('goal-legend',
    `<span class="goal goal--winning highlighted"></span> winning goal (3pts)
      <span class="vdivider"></span>
      <span class="goal goal--tying highlighted"></span> tying goal (1pt)
      <span class="vdivider"></span>
      <span class="goal"></span> goal
      `);
  updateClassedLabel('one-point-label', '1-point goals');
  updateClassedLabel('three-points-label', '3-point goals');
};

const tornado = (data, activeClass) => {
  const ROW_HEIGHT = 20;
  activeClass = activeClass || '';

  const widthRange = [30, 200];
  const goalScale = d3.scaleLinear()
      .domain(d3.extent(data.map(d => d.goals_for)))
      .range(widthRange);
  const pointsScale = d3.scaleLinear()
    .domain(d3.extent(data.map(d => d.points)))
    .range(widthRange);

  const row = playersContainer.select('.tornado-row-container').selectAll('.tornado-row')
    .data(data, d => d.id);
  row.enter()
    .append('div')
    .attr('class', 'tornado-row')
    .html(d => {
      return `
        <div class="tornado-points" style="width:${widthRange[1]}px;">
          <div class="tornado-points__bar" style="width:${pointsScale(d.points)}px;">
            <span>${d.points}</span>
          </div>
        </div>
        <div class="tornado-label">${d.label}</div>
        <div class="tornado-goals" style="width:${widthRange[1]}px;">
          <div class="tornado-goals__bar" style="width:${goalScale(d.goals_for)}px;"><span>${d.goals_for}</span></div>
        </div>
      `
    })
  .merge(row)
    .transition()
    .duration(300)
    .style('top', (d, i) => `${i * ROW_HEIGHT}px`)
  playersContainer.selectAll('.tornado-points, .tornado-goals').style('width', widthRange[1] + 'px');

  row.exit().remove();

  playersContainer.select('.tornado-title-row').attr('class', 'tornado-title-row ' + activeClass);
  playersContainer.select('.tornado-row-container').attr('class', 'tornado-row-container ' + activeClass);
};
const tornadoTeamPoints = () => {
  const sortedByPts = teamStandings.slice().sort( (a, b) => b.points - a.points );
  tornado(sortedByPts, 'sorted-by-points');
}
const tornadoTeamGoals = () => {
  const sortedByGoals = teamStandings.slice().sort( (a, b) => b.goals_for - a.goals_for );
  tornado(sortedByGoals, 'sorted-by-goals');
}
const tornadoPlayerPoints = () => {
  const sortedByGoals = goalLeaders.slice().sort( (a, b) => b.goals_for - a.goals_for );
  tornado(sortedByGoals, 'sorted-by-goals');
};

const tornadoPlayerGoals = () => {
  const sorted = goalLeaders
    .slice()
    .sort( (a, b) => b.points - a.points );
  sorted.forEach( (d, i) => { d.rankDiff = d.goalRank - i - 1;} );
  tornado(sorted, 'sorted-by-points');
};

// -------------------- /scroll step functions

// ----------- scrolly functions
const stepState = {
  table: {
    steps: [
      highlightTableRanks,
      highlightTablePoints,
      highlightTableWinsTies,
      highlightTableGoals,
      highlightTableWinsPoints,
      highlightTableDrawPoints,
    ],
    last: -1,
    delta: 0
  },
  goals: {
    steps: [
      rotateAllGoals,
      highlightTyingGoals,
      highlightWinningGoals
    ],
    last: -1,
    delta: 0
  },
  players: {
    steps: [
      // tornadoTeamPoints,
      // tornadoTeamGoals,
      tornadoPlayerPoints,
      tornadoPlayerGoals,
    ],
    last: -1,
    delta: 0
  }
}

const isStepForward = () => stepState.goals.delta > 0;
const updateStep = (state, step) => {
  state.delta = step - state.last;
  state.last = step;

  if(step < state.steps.length)
    state.steps[step].apply(null);
}

const updateTableStep = step => {
  updateStep(stepState.table, step);
}
const updateGoalStep = step => {
  updateStep(stepState.goals, step);
}
const updatePlayerStep = step => {
  updateStep(stepState.players, step);
}

const graphscroll = () => {
  const gs = s => {
    let el = d3.select(s.selector);
    d3.graphScroll()
      .container(el)
      .graph(el.select('.graphic__vis'))
      .sections(el.selectAll('.graphic__story > .paragraph'))
      .offset(230)
      .on('active', s.handler)
  }

  [
    {selector: '.table-story .graphic', handler: updateTableStep},
    {selector: '.goal-story .graphic', handler: updateGoalStep},
    {selector: '.players-story .graphic', handler: updatePlayerStep}
  ].forEach(gs);
}
// ----------- /scrolly functions



// ----------- templates
const teamDescription = d => {
  return `
    <span class='text-rank active-stat'>${d.rank}.</span>
    <span class='text-team'>${d.team}</span>
    <span class='text-points'>${d.points}pts</span>
    <span class='text-wins'>${d.wins}w</span>
    <span class='text-draws'>${d.draws}d</span>
    <span class='text-losses'>${d.losses}l</span>
    <span class='text-goals-for'>${d.goals_for}gf</span>
    <span class='text-goals-against'>${d.goals_against}ga</span>
    <span class='placeholder'></span>
  `;
}
const playerDescription = d => {
  return `
    <span class='text-goals'>${d.goals} goals</span>
    <span class='text-points'>${d.points} pts</span>
    <span class='text-player'>${d.player}</span>
  `;
}
// ----------- /templates

window.onbeforeunload = function(){ window.scrollTo(0,0); }
start();

# How far the Premier League champions slid down the year after winning the league?


1. Idea

Argue with a friend about consistency of Premier League champions, come up with an idea of visualizing "how far the PL champions slid down the year after winning the league?".

2. Find Data

League tables at the end of the year since EPL start (92/93 season): https://github.com/jokecamp/FootballData/tree/master/EPL%201992%20-%202015/tables

3. Clean the data

This is a very manual process, but I detected only two issues with the data (random trailing spaces and duplicate team names). [`cleandata.js`](cleandata.js) cleans up the data, result is shared with the original repo (https://github.com/jokecamp/FootballData/pull/20)

4. Process the data

`$ node processdata` creates [`data.json`](data.json) for our visualization

5. Rough sketches (TBD)

[`proto1.png`](proto1.png)

6. Visualize (TBD)

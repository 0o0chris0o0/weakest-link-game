import { orderBy as _orderBy, pickBy as _pickBy } from 'lodash';

export function generatePlayers(numPlayers) {
  const players = [];

  for (let i = 0; i < numPlayers; i++) {
    const player = {
      id: i,
      name: `Player ${i + 1}`,
      correctAnswers: 0,
      incorrectAnswers: 0,
      moneyBanked: 0,
      moneyLost: 0
    };
    players.push(player);
  }

  return players;
}

export function determineBestPlayer(players) {
  const sortedPlayers = _orderBy(
    players,
    ['correctAnswers', 'moneyBanked', 'moneyLost'],
    ['desc', 'desc', 'asc']
  );
  return sortedPlayers[0];
}

export function checkOccurance(votes) {
  const voteObj = {};
  let compare = null;
  let mostFrequent = {};
  const tied = [];

  votes.sort();

  for (let i = 0; i < votes.length; i++) {
    const currentVotedId = votes[i];

    // if first occurance
    if (voteObj[currentVotedId] === undefined) {
      // set to 1 vote
      voteObj[currentVotedId] = 1;
    } else {
      // or add 1 to the number of votes
      voteObj[currentVotedId] += 1;
    }

    // if votes are tied
    if (voteObj[currentVotedId] === compare) {
      // set the number of votes that caused the tie
      compare = voteObj[currentVotedId];
      // add playerId to tied array
      tied.push(currentVotedId);
      mostFrequent.result = 'tie';
    } else if (voteObj[currentVotedId] > compare) {
      // set the NEW number of votes that caused the tie
      compare = voteObj[currentVotedId];
      // set the new current leader for votes
      mostFrequent = {
        result: 'winner',
        players: currentVotedId
      };
    }
  }

  if (mostFrequent.result === 'tie') {
    // get values of votes
    const values = Object.values(voteObj);
    // sort and reverse values
    values.sort().reverse();
    // then get the first value to determine the 'magic number' of votes that caused the tie
    const magicNumber = values[0];
    // then select the player's that match that 'magic nuber'
    const tiedPlayers = _pickBy(voteObj, v => v === magicNumber);
    // get the ID's of those players
    mostFrequent.players = Object.keys(tiedPlayers);
  }

  return mostFrequent;
}

export function resetPlayerStats(players) {
  const newPlayers = [];
  for (let i = 0; i < players.length; i++) {
    const currentPlayer = players[i];
    currentPlayer.correctAnswers = 0;
    currentPlayer.incorrectAnswers = 0;
    currentPlayer.moneyBanked = 0;
    currentPlayer.moneyLost = 0;
    newPlayers.push(currentPlayer);
  }

  return newPlayers;
}

export const turnOrder = {
  first: G => G.players[0].id,
  next: (G, ctx) => {
    // get potential next player ID
    let nextPlayer = parseFloat(ctx.currentPlayer) + 1;
    // get id of last player
    const lastPlayer = G.players[G.players.length - 1].id;
    if (nextPlayer > lastPlayer) {
      nextPlayer = G.players[0].id;
    }
    if (G.eliminatedPlayers.length) {
      while (G.eliminatedPlayers.includes(nextPlayer)) {
        nextPlayer += 1;
      }
    }
    return nextPlayer;
  }
};

export function determineHeadToHeadWinner(player1, player2, round, headRound) {
  const reducer = (accumulator, currentValue) => accumulator + currentValue;

  const player1Total = player1
    .map(score => score === 'x' ? 0 : parseFloat(score))
    .reduce(reducer);

  const player2Total = player2
    .map(score => score === 'x' ? 0 : parseFloat(score))
    .reduce(reducer);

  const scoreDifference = Math.abs(player1Total - player2Total);

  // if theres ever a score difference of 3
  if (scoreDifference === 3) {
    const winner = player1Total > player2Total ? 'player 1' : 'player 2';
    console.log(`winner ${winner}`);
    return winner;
  }

  if (round === 4 && scoreDifference >= 2) {
    const winner = player1Total > player2Total ? 'player 1' : 'player 2';
    console.log(`winner ${winner}`);
    return winner;
  }

  if (round === 5 && scoreDifference > 1) {
    const winner = player1Total > player2Total ? 'player 1' : 'player 2';
    console.log(`winner ${winner}`);
    return winner;
  }

  if (round > 5 && scoreDifference && headRound === 0) {
    const winner = player1Total > player2Total ? 'player 1' : 'player 2';
    console.log(`winner ${winner}`);
    return winner;
  }

  return false;
}

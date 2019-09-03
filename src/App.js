import { Client } from 'boardgame.io/client';
import { Game } from 'boardgame.io/core';
import { find as _find, findIndex as _findIndex } from 'lodash';

import { determineHeadToHeadWinner } from './utils';

import {
  generatePlayers,
  determineBestPlayer,
  checkOccurance,
  resetPlayerStats,
  turnOrder
} from './utils';

import Board from './Board';

const WeakestLink = Game({
  setup: numPlayers => ({
    players: generatePlayers(numPlayers),
    round: 0,
    starterTime: 0 + 1 * numPlayers,
    bank: 0,
    scores: ['20', '50', '100', '200', '300', '450', '600', '800', '1000'],
    sequence: null,
    votes: [],
    voteResult: {
      result: null,
      players: []
    },
    topPlayer: null,
    roundBanked: 0,
    roundLost: 0,
    eliminatedPlayers: [],
    lastEliminated: null,
    headToHead: {
      round: 0,
      player0: ['0', '0', '0', '0', '0'],
      player1: ['0', '0', '0', '0', '0']
    }
  }),

  moves: {
    answerQuestion(G, ctx, isCorrect) {
      const Gcopy = Object.assign({}, G);
      const currentPlayerId = parseFloat(ctx.currentPlayer);
      const newState = _find(Gcopy.players, player => player.id === currentPlayerId);
      const answersToUpdate = isCorrect ? 'correctAnswers' : 'incorrectAnswers';
      newState[answersToUpdate] += 1;
      if (!isCorrect && Gcopy.sequence !== null) {
        const currentSequenceScore = parseFloat(Gcopy.scores[Gcopy.sequence]);
        newState.moneyLost = currentSequenceScore;
        Gcopy.roundLost += currentSequenceScore;
      }

      return { ...Gcopy }; // don't mutate original state.
    },
    advanceSequence(G) {
      const Gcopy = Object.assign({}, G);
      if (Gcopy.sequence === null) {
        Gcopy.sequence = 0;
      } else {
        Gcopy.sequence += 1;
      }
      return { ...Gcopy };
    },
    resetSequence(G) {
      const Gcopy = Object.assign({}, G);
      Gcopy.sequence = null;
      return { ...Gcopy };
    },
    bank(G, ctx) {
      const Gcopy = Object.assign({}, G);
      const currentPlayerId = parseFloat(ctx.currentPlayer);
      const newState = _find(Gcopy.players, player => player.id === currentPlayerId);
      // update player banked amount
      const currentAmount = parseFloat(Gcopy.scores[Gcopy.sequence]);
      newState.moneyBanked = parseFloat(currentAmount);
      // update bank
      Gcopy.roundBanked += currentAmount;
      Gcopy.sequence = null;
      return { ...Gcopy };
    },
    castVote(G, ctx, playerId) {
      const Gcopy = Object.assign({}, G);
      Gcopy.votes.push(playerId);
      return { ...Gcopy };
    },
    finalDecision(G, ctx, playerId) {
      const Gcopy = Object.assign({}, G);
      const targetPlayerIndex = _findIndex(
        Gcopy.players,
        player => player.id === parseFloat(playerId)
      );
      const eliminatedPlayer = Gcopy.players.splice(targetPlayerIndex, 1);
      Gcopy.eliminatedPlayers.push(eliminatedPlayer[0].id);
      Gcopy.lastEliminated = eliminatedPlayer[0].name;
      return { ...Gcopy };
    },
    answerHeadToHead(G, ctx, isCorrect) {
      const Gcopy = Object.assign({}, G);
      const currentPlayer = parseFloat(ctx.currentPlayer);
      const newState = Gcopy.headToHead[`player${currentPlayer}`];

      if (isCorrect) {
        newState[G.round] = '1';
      } else {
        newState[G.round] = 'x';
      }

      if (Gcopy.headToHead.round === 1) {
        Gcopy.round += 1;
        Gcopy.headToHead.round = 0;
      } else {
        Gcopy.headToHead.round += 1;
      }

      return { ...Gcopy };
    }
  },
  flow: {
    phases: [
      {
        name: 'pre-game',
        onPhaseBegin: G => {
          const Gcopy = Object.assign({}, G);
          Gcopy.players = resetPlayerStats(Gcopy.players);
          Gcopy.round += 1;
          Gcopy.sequence = null;
          Gcopy.votes = [];
          Gcopy.voteResult = {
            result: null,
            players: []
          };
          Gcopy.topPlayer = null;
          Gcopy.roundBanked = 0;
          Gcopy.roundLost = 0;
          return { ...Gcopy };
        }
      },
      {
        name: 'game',
        allowedMoves: ['answerQuestion', 'advanceSequence', 'resetSequence', 'bank'],
        turnOrder
      },
      {
        name: 'voting',
        allowedMoves: ['castVote'],
        turnOrder,
        endPhaseIf: G => G.votes.length === G.players.length
      },
      {
        name: 'elimination',
        onPhaseBegin: G => {
          const Gcopy = Object.assign({}, G);
          Gcopy.voteResult = checkOccurance(Gcopy.votes);
          if (Gcopy.voteResult.result === 'winner') {
            const targetPlayerIndex = _findIndex(
              Gcopy.players,
              player => player.id === parseFloat(Gcopy.voteResult.players)
            );
            // remove eliminated player
            const eliminatedPlayer = Gcopy.players.splice(targetPlayerIndex, 1);
            Gcopy.eliminatedPlayers.push(eliminatedPlayer[0].id);
            Gcopy.lastEliminated = eliminatedPlayer[0].name;
          } else if (Gcopy.voteResult.result === 'tie') {
            Gcopy.topPlayer = determineBestPlayer(Gcopy.players);
            // make next turn to top player
            // toggle visibility of most voted players: voteResult.players
          }
          return { ...Gcopy };
        }
      },
      {
        name: 'final decision',
        allowedMoves: ['finalDecision']
      },
      {
        name: 'round end',
        onPhaseBegin: G => {
          const Gcopy = Object.assign({}, G);
          Gcopy.bank += Gcopy.roundBanked;
          return { ...Gcopy };
        }
      },
      {
        name: 'head to head',
        allowedMoves: ['answerHeadToHead'],
        turnOrder,
        onPhaseBegin: G => {
          const Gcopy = Object.assign({}, G);
          Gcopy.round = 0;
          return { ...Gcopy };
        },
        endPhaseIf: G => {
          const Gcopy = Object.assign({}, G);
          const winner = determineHeadToHeadWinner(
            Gcopy.headToHead.player0,
            Gcopy.headToHead.player1,
            Gcopy.round,
            Gcopy.headToHead.round
          );
          if (winner) {
            return true;
          }
          return false;
        }
      }
    ]
  }
});

const Main = Client({
  game: WeakestLink,
  numPlayers: 3,
  board: Board
  // debug: false
});

export default Main;

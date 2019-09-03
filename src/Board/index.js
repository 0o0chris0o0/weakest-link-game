import React from 'react';
import PropTypes from 'prop-types';
// import axios from 'axios';
import { cloneDeep as _cloneDeep } from 'lodash';

import styles from './board.module.scss';
import exampleResponse from '../response.json';

import Question from './Question';
import ScoreBoard from './ScoreBoard';
import OtherPlayers from './OtherPlayers';
import Timer from './Timer';
import RoundStarter from './RoundStarter';
import HeadToHead from '../HeadToHead';

export default class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      questions: {
        status: 'idle',
        data: []
      },
      timer: this.props.G.starterTime,
      disableBank: true
    };

    this.getQuestions = this.getQuestions.bind(this);
    this.answerQuestion = this.answerQuestion.bind(this);
    this.bankMoney = this.bankMoney.bind(this);
    this.startRound = this.startRound.bind(this);
    this.nextRound = this.nextRound.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.castVote = this.castVote.bind(this);
  }

  componentWillMount() {
    this.getQuestions();
  }

  componentDidUpdate() {
    const { voteResult, players, topPlayer } = this.props.G;
    const { phase } = this.props.ctx;
    if ((phase === 'elimination' || phase === 'final decision') && voteResult.result === 'winner') {
      this.props.events.endPhase();
    }
    if (phase === 'elimination' && topPlayer !== null) {
      this.props.events.endPhase();
    }
    if (phase === 'head to head' && players.length !== 2) {
      this.props.events.endPhase();
    }
  }

  getQuestions() {
    // axios
    //   .get('https://opentdb.com/api.php?amount=30&category=9&difficulty=easy&type=multiple')
    //   .then(response => {
    //     const questions = {
    //       status: 'complete',
    //       data: response.data ? response.data.results : exampleResponse.data.results
    //     };
    //     this.setState({ questions });
    //   });
    this.setState({ questions: { status: 'complete', data: exampleResponse.data.results } });
  }

  answerQuestion(isCorrect) {
    this.props.moves.answerQuestion(isCorrect);
    if (isCorrect) {
      this.props.moves.advanceSequence();
      this.toggleBank();
    } else {
      this.props.moves.resetSequence();
    }
    this.props.events.endTurn();
  }

  toggleBank() {
    clearTimeout(this.bankToggle);
    this.setState({
      disableBank: false
    });
    this.bankToggle = setTimeout(() => {
      this.setState({
        disableBank: true
      });
    }, 2500);
  }

  bankMoney() {
    this.props.moves.bank();
  }

  startRound() {
    this.props.events.endPhase();
    this.timer = setInterval(this.updateTimer, 1000);
    this.setState({
      intervalId: this.timer
    });
  }

  nextRound() {
    const { players } = this.props.G;
    this.setState({
      timer: 6 + 10 * players.length
    });
    this.props.events.endPhase();
  }

  updateTimer() {
    if (this.state.timer > 0) {
      this.setState({
        timer: this.state.timer - 1
      });
    } else {
      clearInterval(this.timer);
      // Game round has ended
      this.props.events.endPhase();
    }
  }

  castVote(playerId) {
    const { phase } = this.props.ctx;

    if (phase === 'final decision') {
      this.props.moves.finalDecision(playerId);
      this.props.events.endPhase();
    } else {
      this.props.moves.castVote(playerId);
      this.props.events.endTurn();
    }
  }

  render() {
    const { sequence, roundBanked, bank, round, scores } = this.props.G;
    const { turn, phase, currentPlayer } = this.props.ctx;
    const { questions, timer } = this.state;

    const currentQuestion = _cloneDeep(questions.data[turn]);

    return (
      <div className={styles.board}>
        <h1 className="text-center">
          {phase !== 'head to head' ? `Round ${round}` : 'Head To Head'}
        </h1>
        <div className="grid-container">
          {phase !== 'head to head' ? (
            <div className="grid-x grid-margin-x">
              <div className="cell small-9">
                {questions.status === 'complete' && (
                  <div className={styles.questionContainer}>
                    <RoundStarter
                      phase={phase}
                      startRound={this.startRound}
                      nextRound={this.nextRound}
                      game={this.props.G}
                    />
                    <Question question={currentQuestion} answerQuestion={this.answerQuestion} />
                  </div>
                )}
                <OtherPlayers
                  activePlayer={parseFloat(currentPlayer)}
                  phase={phase}
                  castVote={this.castVote}
                  game={this.props.G}
                />
                <div className="grid-x align-middle">
                  <div className="cell small-7 text-center">
                    <button
                      className={`button alert ${styles.bankButton}`}
                      onClick={this.bankMoney}
                      disabled={this.state.disableBank || sequence === null}>
											BANK
                    </button>
                  </div>
                  <div className="cell small-5 text-center">
                    <Timer time={timer} />
                  </div>
                </div>
                <div className="text-center">
                  <div className={styles.bankTotal}>Total: £{bank}</div>
                </div>
              </div>
              <div className="cell small-3">
                <ScoreBoard scores={scores} sequence={sequence} bank={roundBanked} />
              </div>
            </div>
          ) : (
            <HeadToHead
              moves={this.props.moves}
              G={this.props.G}
              events={this.props.events}
              turn={turn}
              currentPlayer={currentPlayer}
            />
          )}
        </div>
      </div>
    );
  }
}

Board.propTypes = {
  name: PropTypes.string
};

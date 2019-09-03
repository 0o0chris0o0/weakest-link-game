import React from 'react';
import PropTypes from 'prop-types';
// import axios from 'axios';
import { cloneDeep as _cloneDeep } from 'lodash';
import classNames from 'classnames';

import styles from './headToHead.scss';
import exampleResponse from '../response.json';

import Question from '../Board/Question';

export default class HeadToHead extends React.Component {
  constructor(props) {
    super(props);

    this.getQuestions = this.getQuestions.bind(this);
    this.answerQuestion = this.answerQuestion.bind(this);
  }

  componentWillMount() {
    this.getQuestions();
  }

  getQuestions() {
    // axios
    //   .get('https://opentdb.com/api.php?amount=30&category=9&difficulty=hard&type=multiple')
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
    this.props.moves.answerHeadToHead(isCorrect);
    this.props.game.endTurn();
  }

  render() {
    const { questions } = this.state;
    const { G, turn, currentPlayer } = this.props;

    const currentQuestion = _cloneDeep(questions.data[turn]);

    const player1Elems = G.headToHead.player0.map((score, i) => {
      const circleStyles = classNames(styles.circle, {
        [styles.correct]: score === '1',
        [styles.incorrect]: score === 'x'
      });
      return (
        <div className="cell small-2 text-center" key={i}>
          <div className={circleStyles} />
        </div>
      );
    });

    const player2Elems = G.headToHead.player1.map((score, i) => {
      const circleStyles = classNames(styles.circle, {
        [styles.correct]: score === '1',
        [styles.incorrect]: score === 'x'
      });
      return (
        <div className="cell small-2 text-center" key={i}>
          <div className={circleStyles} />
        </div>
      );
    });

    return (
      <div className="grid-container">
        <div className={styles.question}>
          <Question question={currentQuestion} answerQuestion={this.answerQuestion} />
        </div>
        <div className="text-center">
          <div className={`${styles.player} ${currentPlayer === 0 ? styles.activePlayer : ''}`}>
            <h2>Player 1</h2>
            <div className="grid-x align-center">
              {G.round < 5 ? 
                player1Elems
							 : (
                  <div className="cell text-center">
                    <div
                      className={`${styles.circle} ${
                        G.headToHead.player0[G.round] === '1' ? styles.correct : ''
                      } ${G.headToHead.player0[G.round] === 'x' ? styles.incorrect : ''}`}
                    />
                  </div>
                )}
            </div>
          </div>
          <div className={`${styles.player} ${currentPlayer === 1 ? styles.activePlayer : ''}`}>
            <h2>Player 2</h2>
            <div className="grid-x align-center">
              {G.round < 5 ? 
                player2Elems
							 : (
                  <div className="cell text-center">
                    <div className={styles.circle} />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HeadToHead.propTypes = {
  name: PropTypes.string
};

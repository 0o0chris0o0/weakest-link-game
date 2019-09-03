import React from 'react';
import PropTypes from 'prop-types';

import styles from './answers.module.scss';

export default class Answers extends React.Component {
  constructor(props) {
    super(props);

    this.submitAnswer = this.submitAnswer.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return this.props.correctAnswer !== nextProps.correctAnswer
  }

  submitAnswer(event) {
    const { correctAnswer } = this.props;
    const answer = event.target.dataset.answer;
    this.props.submitAnswer(correctAnswer === answer);
  }

  render() {
    const { incorrectAnswers, correctAnswer } = this.props;
    const abc = ['A', 'B', 'C', 'D'];
    const randId = Math.floor(Math.random() * (3 + 1));

    const allAnswers = incorrectAnswers.splice(0);
    allAnswers.splice(randId, 0, correctAnswer);

    const answerElems = allAnswers.map((answer, i) => {
      return (
        <div key={i} className="cell small-6">
          <button
            className={`button ${styles.button}`}
            data-answer={answer}
            onClick={this.submitAnswer}
          >
            <span className={styles.letter}>{`${abc[i]}. `}</span>
            <span dangerouslySetInnerHTML={{ __html: answer }} />
          </button>
        </div>
      );
    });

    return <div className="grid-x text-left">{answerElems}</div>;
  }
}

Answers.propTypes = {
  name: PropTypes.string
};

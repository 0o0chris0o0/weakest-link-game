import React from 'react';
import PropTypes from 'prop-types';

import styles from './question.module.scss';

import Answers from './Answers';

export default class Question extends React.Component {
  constructor(props) {
    super(props);

    this.submitAnswer = this.submitAnswer.bind(this);
  }

  submitAnswer(isCorrect) {
    this.props.answerQuestion(isCorrect);
  }

  render() {
    const { question, incorrect_answers, correct_answer } = this.props.question;
    
    return (
      <div>
        <p className={styles.question} dangerouslySetInnerHTML={{ __html: question }} />
        <Answers incorrectAnswers={incorrect_answers} correctAnswer={correct_answer} submitAnswer={this.submitAnswer}/>
      </div>
    );
  }
}

Question.propTypes = {
  name: PropTypes.string
};

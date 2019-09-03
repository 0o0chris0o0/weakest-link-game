import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './scoreboard.scss';

export default function ScoreBoard({ scores, sequence, bank }) {
  const scoreRange = scores.slice(0).reverse();
  const scoreBoard = scoreRange.map(amount => {
    const scoreClass = classNames({
      [styles.scorePusher]: scores[sequence] === amount,
      [styles.scoreFader]: scores.indexOf(amount) < scores.indexOf(scores[sequence])
    });
    return (
      <div key={amount} className={`cell ${scoreClass}`}>
        <div className={styles.scoreButton}>{`£${amount}`}</div>
      </div>
    );
  });

  return (
    <div className={`grid-y ${styles.moneyBoard} text-center`}>
      <div className="cell small-11">
        <div className={`grid-y ${styles.moneyBoardScores}`}>{scoreBoard}</div>
      </div>
      <div className={`cell small-1 ${styles.bank}`}>
        <div className={styles.bankButton}>£{bank}</div>
        <span>BANK</span>
      </div>
    </div>
  );
}

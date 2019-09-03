import React from 'react';
import PropTypes from 'prop-types';

import styles from './roundStarter.scss';

export default class RoundStarter extends React.Component {
  constructor(props) {
    super(props);

    this.startRound = this.startRound.bind(this);
    this.nextRound = this.nextRound.bind(this);
  }

  startRound() {
    this.props.startRound();
  }

  nextRound() {
    this.props.nextRound();
  }

  render() {
    const { phase } = this.props;
    const { roundBanked, roundLost, lastEliminated, topPlayer } = this.props.game;

    return (
      <div className={`${styles.roundStarter} ${phase === 'game' ? styles.inactive : ''}`}>
        {phase === 'pre-game' ? (
          <button className="button" onClick={this.startRound}>
						Start Game
          </button>
        ) : null}
        {phase === 'voting' ? (
          <div className={styles.voting}>
            <h3>End of Round</h3>
            <p>
							During that round you manage to bank:{' '}
              <span className={styles.won}>£{roundBanked}</span>
            </p>
            <p>
							but you lost: <span className={styles.lost}>£{roundLost}</span>
            </p>
            <p className={styles.instruction}>Vote for who you think is the weakest link...</p>
          </div>
        ) : null}
        {phase === 'final decision' && topPlayer !== null ? (
          <div className={styles.finalDecision}>
            <h3>There was a tie in the votes!</h3>
            <p>
              <span>{topPlayer.name}</span> as the best player from the last round you get the final decision...
            </p>
          </div>
        ) : null}
        {phase === 'round end' ? (
          <div className={styles.eliminated}>
            <h3>{lastEliminated} was eliminated</h3>
            <button className="button" onClick={this.nextRound}>
							Next Round
            </button>
          </div>
        ) : null}
      </div>
    );
  }
}

RoundStarter.propTypes = {
  name: PropTypes.string
};

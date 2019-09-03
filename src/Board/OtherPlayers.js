import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep as _cloneDeep } from 'lodash';
import classNames from 'classnames';

import styles from './otherPlayers.scss';

export default class OtherPlayers extends React.Component {
  constructor(props) {
    super(props);

    this.castVote = this.castVote.bind(this);
  }

  castVote(event) {
    const id = event.target.id;
    this.props.castVote(id);
  }

  render() {
    const { players, topPlayer, voteResult } = this.props.game;
    const { activePlayer, phase } = this.props;
    const otherPlayers = _cloneDeep(players);

    const otherPlayerElems = otherPlayers.map(player => {
      const panelStyles = classNames(styles.playerPanel, {
        [styles.active]: player.id === activePlayer && (phase === 'game' || phase === 'voting'),
        [styles.inactive]: topPlayer !== null && player.id !== topPlayer.id && !voteResult.players.includes(player.id.toString()),
        [styles.decider]: topPlayer !== null && player.id === topPlayer.id
      });
      return (
        <div key={player.id} className="cell small-4 auto text-center">
          {phase === 'voting' || phase === 'final decision' ? (
            <button
              className={panelStyles}
              onClick={this.castVote}
              id={player.id}
              disabled={phase === 'final decision' && !voteResult.players.includes(player.id.toString())}
            >
              {player.name}
            </button>
          ) : (
            <div className={panelStyles}>{player.name}</div>
          )}
        </div>
      );
    });

    return (
      <div className={styles.otherPlayers}>
        <div className="grid-x grid-margin-x grid-margin-y">{otherPlayerElems}</div>
      </div>
    );
  }
}

OtherPlayers.propTypes = {
  name: PropTypes.string
};

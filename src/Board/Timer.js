import React from 'react';
import PropTypes from 'prop-types';

import styles from './timer.module.scss';

export default function Timer({ time }) {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return <div className={styles.timer}>{`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`}</div>;
}

Timer.propTypes = {
  name: PropTypes.string
};

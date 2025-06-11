export const GAME_CONFIG = {
  BOARD_SIZE: 10,
  NUM_SHIPS: 3,
  SHIP_LENGTH: 3
};

export const CELL_STATES = {
  EMPTY: '~',
  SHIP: 'S',
  HIT: 'X',
  MISS: 'O'
};

export const CPU_MODES = {
  HUNT: 'hunt',
  TARGET: 'target'
};

export const SHIP_ORIENTATIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
};

export const GAME_MESSAGES = {
  PLAYER_HIT: 'PLAYER HIT!',
  PLAYER_MISS: 'PLAYER MISS.',
  CPU_HIT: 'CPU HIT',
  CPU_MISS: 'CPU MISS',
  SHIP_SUNK: 'ship sunk',
  INVALID_INPUT: 'Oops, input must be exactly two digits (e.g., 00, 34, 98).',
  INVALID_COORDINATES: 'Oops, please enter valid row and column numbers between 0 and',
  ALREADY_GUESSED: 'You already guessed that location!',
  PLAYER_WINS: '*** CONGRATULATIONS! You sunk all enemy battleships! ***',
  CPU_WINS: '*** GAME OVER! The CPU sunk all your battleships! ***'
}; 
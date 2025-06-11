import Player from './Player.js';
import { GAME_CONFIG, CPU_MODES, GAME_MESSAGES } from '../utils/constants.js';

export class CPUPlayer extends Player {
  constructor(name, board) {
    super(name, board);
    this.mode = CPU_MODES.HUNT;
    this.targetQueue = [];
    this.guesses = [];
  }

  /**
   * Make an AI guess on the opponent's board
   * @param {Board} opponentBoard - The opponent's board
   * @returns {object} - Result of the guess
   */
  makeGuess(opponentBoard) {
    let guess;
    let validGuess = false;

    while (!validGuess) {
      if (this.mode === CPU_MODES.TARGET && this.targetQueue.length > 0) {
        guess = this.targetQueue.shift();
        if (!this.guesses.includes(guess)) {
          validGuess = true;
        } else if (this.targetQueue.length === 0) {
          this.mode = CPU_MODES.HUNT;
        }
      }

      if (!validGuess) {
        this.mode = CPU_MODES.HUNT;
        guess = this.generateRandomGuess();
        validGuess = !this.guesses.includes(guess);
      }
    }

    this.guesses.push(guess);
    const result = opponentBoard.processGuess(guess);

    if (result.hit) {
      if (result.sunk) {
        console.log(`${GAME_MESSAGES.CPU_HIT} at ${guess}! CPU sunk your battleship!`);
        this.mode = CPU_MODES.HUNT;
        this.targetQueue = [];
      } else {
        console.log(`${GAME_MESSAGES.CPU_HIT} at ${guess}!`);
        this.mode = CPU_MODES.TARGET;
        this.addAdjacentTargets(guess);
      }
    } else {
      console.log(`${GAME_MESSAGES.CPU_MISS} at ${guess}.`);
      if (this.mode === CPU_MODES.TARGET && this.targetQueue.length === 0) {
        this.mode = CPU_MODES.HUNT;
      }
    }

    return {
      success: true,
      hit: result.hit,
      sunk: result.sunk,
      guess: guess,
      message: result.hit ? 
        (result.sunk ? 'CPU sunk your battleship!' : 'CPU hit your ship!') :
        'CPU missed.'
    };
  }

  /**
   * Generate a random guess for hunt mode
   * @returns {string} - Random guess in format "rowcol"
   */
  generateRandomGuess() {
    const row = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
    const col = Math.floor(Math.random() * GAME_CONFIG.BOARD_SIZE);
    return `${row}${col}`;
  }

  /**
   * Add adjacent cells to target queue when a hit is made
   * @param {string} hitLocation - Location of the hit in format "rowcol"
   */
  addAdjacentTargets(hitLocation) {
    const row = parseInt(hitLocation[0]);
    const col = parseInt(hitLocation[1]);

    const adjacentCells = [
      { r: row - 1, c: col },
      { r: row + 1, c: col },
      { r: row, c: col - 1 },
      { r: row, c: col + 1 }
    ];

    adjacentCells.forEach(cell => {
      if (this.isValidTarget(cell.r, cell.c)) {
        const targetGuess = `${cell.r}${cell.c}`;
        if (!this.targetQueue.includes(targetGuess)) {
          this.targetQueue.push(targetGuess);
        }
      }
    });
  }

  /**
   * Check if a target is valid (within bounds and not already guessed)
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} - True if target is valid
   */
  isValidTarget(row, col) {
    if (row < 0 || row >= GAME_CONFIG.BOARD_SIZE || 
        col < 0 || col >= GAME_CONFIG.BOARD_SIZE) {
      return false;
    }

    const guessStr = `${row}${col}`;
    return !this.guesses.includes(guessStr);
  }

  /**
   * Get the current AI mode
   * @returns {string} - Current mode (hunt or target)
   */
  getMode() {
    return this.mode;
  }

  /**
   * Get the current target queue
   * @returns {string[]} - Array of target locations
   */
  getTargetQueue() {
    return [...this.targetQueue];
  }

  /**
   * Get all guesses made by the CPU
   * @returns {string[]} - Array of guess locations
   */
  getGuesses() {
    return [...this.guesses];
  }

  /**
   * Reset the CPU state (for testing or new games)
   */
  reset() {
    this.mode = CPU_MODES.HUNT;
    this.targetQueue = [];
    this.guesses = [];
  }
}

export default CPUPlayer; 
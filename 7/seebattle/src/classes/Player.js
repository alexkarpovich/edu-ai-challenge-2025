import { GAME_CONFIG, GAME_MESSAGES } from '../utils/constants.js';

export class Player {
  constructor(name, board) {
    this.name = name;
    this.board = board;
  }

  /**
   * Validate player input for coordinates
   * @param {string} input - Player input
   * @returns {object} - Object with isValid, row, col, and errorMessage
   */
  validateInput(input) {
    if (!input || input.length !== 2) {
      return { 
        isValid: false, 
        errorMessage: GAME_MESSAGES.INVALID_INPUT 
      };
    }

    const row = parseInt(input[0]);
    const col = parseInt(input[1]);

    if (isNaN(row) || isNaN(col) || 
        row < 0 || row >= GAME_CONFIG.BOARD_SIZE || 
        col < 0 || col >= GAME_CONFIG.BOARD_SIZE) {
      return { 
        isValid: false, 
        errorMessage: `${GAME_MESSAGES.INVALID_COORDINATES} ${GAME_CONFIG.BOARD_SIZE - 1}.`
      };
    }

    return { isValid: true, row, col };
  }

  /**
   * Make a guess on the opponent's board
   * @param {string} guess - Guess in format "rowcol"
   * @param {Board} opponentBoard - The opponent's board
   * @returns {object} - Result of the guess
   */
  makeGuess(guess, opponentBoard) {
    const validation = this.validateInput(guess);
    if (!validation.isValid) {
      return { 
        success: false, 
        message: validation.errorMessage 
      };
    }

    const result = opponentBoard.processGuess(guess);
    
    if (result.alreadyGuessed) {
      return { 
        success: false, 
        message: GAME_MESSAGES.ALREADY_GUESSED 
      };
    }

    const message = result.hit ? 
      (result.sunk ? `${GAME_MESSAGES.PLAYER_HIT} You sunk an enemy battleship!` : GAME_MESSAGES.PLAYER_HIT) :
      GAME_MESSAGES.PLAYER_MISS;

    return { 
      success: true, 
      hit: result.hit, 
      sunk: result.sunk, 
      message 
    };
  }

  /**
   * Get the player's name
   * @returns {string} - Player name
   */
  getName() {
    return this.name;
  }

  /**
   * Get the player's board
   * @returns {Board} - Player's board
   */
  getBoard() {
    return this.board;
  }

  /**
   * Check if the player has lost (all ships sunk)
   * @returns {boolean} - True if player has lost
   */
  hasLost() {
    return this.board.areAllShipsSunk();
  }

  /**
   * Get the number of remaining ships
   * @returns {number} - Number of ships not yet sunk
   */
  getRemainingShips() {
    return this.board.getRemainingShipCount();
  }
}

export default Player; 
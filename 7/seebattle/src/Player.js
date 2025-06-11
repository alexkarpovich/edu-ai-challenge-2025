import { GameBoard } from './GameBoard.js';

/**
 * Represents a player in the battleship game
 */
export class Player {
  constructor(name, boardSize = 10) {
    this.name = name;
    this.board = new GameBoard(boardSize);
    this.opponentBoard = new GameBoard(boardSize);
    this.isHuman = true;
  }

  /**
   * Sets up the player's ships
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  setupShips(numberOfShips, shipLength) {
    this.board.placeShipsRandomly(numberOfShips, shipLength);
  }

  /**
   * Makes a guess against the opponent
   * @param {string} guess - The guess location (e.g., "23")
   * @param {Player} opponent - The opponent player
   * @returns {Object} - Result of the guess
   */
  makeGuess(guess, opponent) {
    // Validate the guess format
    const validation = this.opponentBoard.validateGuess(guess);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Check if already guessed on our tracking board
    if (this.opponentBoard.getGuesses().has(guess)) {
      return { success: false, error: 'You already guessed that location!' };
    }

    // Process the guess on opponent's actual board
    const result = opponent.board.processGuess(guess);
    
    // Update our tracking board
    this.opponentBoard.guesses.add(guess);
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);
    
    if (result.hit) {
      this.opponentBoard.grid[row][col] = 'X';
    } else {
      this.opponentBoard.grid[row][col] = 'O';
    }

    return {
      success: true,
      hit: result.hit,
      sunk: result.sunk,
      shipSunk: result.ship && result.sunk ? result.ship : null
    };
  }

  /**
   * Checks if this player has won (opponent has no ships left)
   * @param {Player} opponent - The opponent player
   * @returns {boolean} - True if this player has won
   */
  hasWon(opponent) {
    return opponent.board.allShipsSunk();
  }

  /**
   * Gets the number of remaining ships for this player
   * @returns {number} - Number of ships still afloat
   */
  getRemainingShips() {
    return this.board.getRemainingShipsCount();
  }

  /**
   * Gets a display-friendly representation of the player's board
   * @param {boolean} showShips - Whether to show ship locations
   * @returns {string[][]} - 2D array for display
   */
  getDisplayBoard(showShips = true) {
    return this.board.getDisplayGrid(showShips);
  }

  /**
   * Gets a display-friendly representation of the opponent tracking board
   * @returns {string[][]} - 2D array for display
   */
  getOpponentTrackingBoard() {
    return this.opponentBoard.getDisplayGrid(false);
  }
} 
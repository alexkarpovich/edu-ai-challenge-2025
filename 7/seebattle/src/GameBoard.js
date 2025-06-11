import { Ship } from './Ship.js';

/**
 * Represents a game board for the battleship game
 */
export class GameBoard {
  constructor(size = 10) {
    this.size = size;
    this.grid = this.createEmptyGrid();
    this.ships = [];
    this.guesses = new Set();
  }

  /**
   * Creates an empty grid filled with water (~)
   * @returns {string[][]} - 2D array representing the board
   */
  createEmptyGrid() {
    return Array(this.size).fill(null).map(() => Array(this.size).fill('~'));
  }

  /**
   * Places ships randomly on the board
   * @param {number} numberOfShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   */
  placeShipsRandomly(numberOfShips, shipLength) {
    let placedShips = 0;
    const maxAttempts = 1000; // Prevent infinite loops
    let attempts = 0;

    while (placedShips < numberOfShips && attempts < maxAttempts) {
      attempts++;
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const { startRow, startCol } = this.getRandomStartPosition(shipLength, orientation);
      
      if (this.canPlaceShip(startRow, startCol, shipLength, orientation)) {
        this.placeShip(startRow, startCol, shipLength, orientation);
        placedShips++;
      }
    }

    if (placedShips < numberOfShips) {
      throw new Error(`Could not place all ships. Only placed ${placedShips} of ${numberOfShips}`);
    }
  }

  /**
   * Gets a random starting position for ship placement
   * @param {number} shipLength - Length of the ship
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @returns {Object} - Object with startRow and startCol properties
   */
  getRandomStartPosition(shipLength, orientation) {
    let startRow, startCol;
    
    if (orientation === 'horizontal') {
      startRow = Math.floor(Math.random() * this.size);
      startCol = Math.floor(Math.random() * (this.size - shipLength + 1));
    } else {
      startRow = Math.floor(Math.random() * (this.size - shipLength + 1));
      startCol = Math.floor(Math.random() * this.size);
    }

    return { startRow, startCol };
  }

  /**
   * Checks if a ship can be placed at the specified position
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} shipLength - Length of the ship
   * @param {string} orientation - 'horizontal' or 'vertical'
   * @returns {boolean} - True if ship can be placed
   */
  canPlaceShip(startRow, startCol, shipLength, orientation) {
    for (let i = 0; i < shipLength; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;

      if (row >= this.size || col >= this.size || this.grid[row][col] !== '~') {
        return false;
      }
    }
    return true;
  }

  /**
   * Places a ship on the board
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {number} shipLength - Length of the ship
   * @param {string} orientation - 'horizontal' or 'vertical'
   */
  placeShip(startRow, startCol, shipLength, orientation) {
    const ship = new Ship(shipLength);
    const locations = [];

    for (let i = 0; i < shipLength; i++) {
      const row = orientation === 'horizontal' ? startRow : startRow + i;
      const col = orientation === 'horizontal' ? startCol + i : startCol;
      const location = `${row}${col}`;
      
      locations.push(location);
      this.grid[row][col] = 'S';
    }

    ship.setLocations(locations);
    this.ships.push(ship);
  }

  /**
   * Processes a guess at the specified coordinates
   * @param {string} guess - Guess in format "rc" (e.g., "23")
   * @returns {Object} - Result object with hit, sunk, and ship information
   */
  processGuess(guess) {
    if (this.guesses.has(guess)) {
      return { alreadyGuessed: true, hit: false, sunk: false };
    }

    this.guesses.add(guess);
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    // Find if any ship occupies this location
    const hitShip = this.ships.find(ship => ship.occupiesLocation(guess));

    if (hitShip) {
      const wasAlreadyHit = hitShip.isHitAt(guess);
      if (!wasAlreadyHit) {
        hitShip.hit(guess);
        this.grid[row][col] = 'X';
        return {
          hit: true,
          sunk: hitShip.isSunk(),
          ship: hitShip,
          alreadyGuessed: false
        };
      } else {
        return { alreadyGuessed: true, hit: true, sunk: false };
      }
    } else {
      this.grid[row][col] = 'O';
      return { hit: false, sunk: false, alreadyGuessed: false };
    }
  }

  /**
   * Gets the number of ships remaining (not sunk)
   * @returns {number} - Number of ships still afloat
   */
  getRemainingShipsCount() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }

  /**
   * Checks if all ships have been sunk
   * @returns {boolean} - True if all ships are sunk
   */
  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  /**
   * Validates if a guess is in the correct format and within bounds
   * @param {string} guess - The guess to validate
   * @returns {Object} - Validation result with isValid and error message
   */
  validateGuess(guess) {
    if (!guess || guess.length !== 2) {
      return {
        isValid: false,
        error: 'Input must be exactly two digits (e.g., 00, 34, 98)'
      };
    }

    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    if (isNaN(row) || isNaN(col) || row < 0 || row >= this.size || col < 0 || col >= this.size) {
      return {
        isValid: false,
        error: `Please enter valid row and column numbers between 0 and ${this.size - 1}`
      };
    }

    return { isValid: true };
  }

  /**
   * Gets a copy of the grid for display purposes
   * @param {boolean} showShips - Whether to show ship locations
   * @returns {string[][]} - Copy of the grid
   */
  getDisplayGrid(showShips = true) {
    return this.grid.map(row => 
      row.map(cell => {
        if (!showShips && cell === 'S') {
          return '~';
        }
        return cell;
      })
    );
  }

  /**
   * Gets all locations that have been guessed
   * @returns {Set<string>} - Set of guessed locations
   */
  getGuesses() {
    return new Set(this.guesses);
  }
} 
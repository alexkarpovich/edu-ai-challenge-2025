import { GAME_CONFIG, CELL_STATES, SHIP_ORIENTATIONS } from '../utils/constants.js';
import Ship from './Ship.js';

export class Board {
  constructor() {
    this.size = GAME_CONFIG.BOARD_SIZE;
    this.grid = this.createEmptyGrid();
    this.ships = [];
    this.guesses = [];
  }

  /**
   * Create an empty grid filled with empty cells
   * @returns {string[][]} - 2D array representing the board
   */
  createEmptyGrid() {
    return Array(this.size).fill(null).map(() => 
      Array(this.size).fill(CELL_STATES.EMPTY)
    );
  }

  /**
   * Place ships randomly on the board
   * @param {number} numShips - Number of ships to place
   * @param {number} shipLength - Length of each ship
   * @param {boolean} showShips - Whether to show ships on the grid (for player board)
   */
  placeShipsRandomly(numShips = GAME_CONFIG.NUM_SHIPS, shipLength = GAME_CONFIG.SHIP_LENGTH, showShips = false) {
    let placedShips = 0;
    
    while (placedShips < numShips) {
      const orientation = Math.random() < 0.5 ? SHIP_ORIENTATIONS.HORIZONTAL : SHIP_ORIENTATIONS.VERTICAL;
      const { startRow, startCol } = this.getRandomStartPosition(orientation, shipLength);
      
      if (this.canPlaceShip(startRow, startCol, orientation, shipLength)) {
        const locations = this.getShipLocations(startRow, startCol, orientation, shipLength);
        const ship = new Ship(locations);
        
        this.ships.push(ship);
        
        if (showShips) {
          this.markShipOnGrid(locations);
        }
        
        placedShips++;
      }
    }
  }

  /**
   * Get random starting position for ship placement
   * @param {string} orientation - Ship orientation
   * @param {number} shipLength - Length of the ship
   * @returns {object} - Object with startRow and startCol
   */
  getRandomStartPosition(orientation, shipLength) {
    if (orientation === SHIP_ORIENTATIONS.HORIZONTAL) {
      return {
        startRow: Math.floor(Math.random() * this.size),
        startCol: Math.floor(Math.random() * (this.size - shipLength + 1))
      };
    } else {
      return {
        startRow: Math.floor(Math.random() * (this.size - shipLength + 1)),
        startCol: Math.floor(Math.random() * this.size)
      };
    }
  }

  /**
   * Check if a ship can be placed at the given position
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {string} orientation - Ship orientation
   * @param {number} shipLength - Length of the ship
   * @returns {boolean} - True if ship can be placed
   */
  canPlaceShip(startRow, startCol, orientation, shipLength) {
    for (let i = 0; i < shipLength; i++) {
      const row = orientation === SHIP_ORIENTATIONS.HORIZONTAL ? startRow : startRow + i;
      const col = orientation === SHIP_ORIENTATIONS.HORIZONTAL ? startCol + i : startCol;
      
      if (row >= this.size || col >= this.size || this.grid[row][col] !== CELL_STATES.EMPTY) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get ship locations for given position and orientation
   * @param {number} startRow - Starting row
   * @param {number} startCol - Starting column
   * @param {string} orientation - Ship orientation
   * @param {number} shipLength - Length of the ship
   * @returns {string[]} - Array of location strings
   */
  getShipLocations(startRow, startCol, orientation, shipLength) {
    const locations = [];
    for (let i = 0; i < shipLength; i++) {
      const row = orientation === SHIP_ORIENTATIONS.HORIZONTAL ? startRow : startRow + i;
      const col = orientation === SHIP_ORIENTATIONS.HORIZONTAL ? startCol + i : startCol;
      locations.push(`${row}${col}`);
    }
    return locations;
  }

  /**
   * Mark ship locations on the grid
   * @param {string[]} locations - Array of location strings
   */
  markShipOnGrid(locations) {
    locations.forEach(location => {
      const row = parseInt(location[0]);
      const col = parseInt(location[1]);
      this.grid[row][col] = CELL_STATES.SHIP;
    });
  }

  /**
   * Process a guess on this board
   * @param {string} guess - Guess in format "rowcol"
   * @returns {object} - Object with hit, sunk, and alreadyGuessed properties
   */
  processGuess(guess) {
    if (this.guesses.includes(guess)) {
      return { hit: false, sunk: false, alreadyGuessed: true };
    }

    this.guesses.push(guess);
    const row = parseInt(guess[0]);
    const col = parseInt(guess[1]);

    // Check if any ship is hit
    for (const ship of this.ships) {
      if (ship.isHitAt(guess)) {
        if (ship.isAlreadyHit(guess)) {
          return { hit: true, sunk: false, alreadyGuessed: true };
        }
        
        ship.hit(guess);
        this.grid[row][col] = CELL_STATES.HIT;
        
        return { 
          hit: true, 
          sunk: ship.isSunk(), 
          alreadyGuessed: false 
        };
      }
    }

    // Miss
    this.grid[row][col] = CELL_STATES.MISS;
    return { hit: false, sunk: false, alreadyGuessed: false };
  }

  /**
   * Check if all ships are sunk
   * @returns {boolean} - True if all ships are sunk
   */
  areAllShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  /**
   * Get the current state of the grid
   * @returns {string[][]} - Copy of the current grid
   */
  getGrid() {
    return this.grid.map(row => [...row]);
  }

  /**
   * Get the list of guesses made on this board
   * @returns {string[]} - Array of guess strings
   */
  getGuesses() {
    return [...this.guesses];
  }

  /**
   * Get the number of remaining ships
   * @returns {number} - Number of ships not yet sunk
   */
  getRemainingShipCount() {
    return this.ships.filter(ship => !ship.isSunk()).length;
  }
}

export default Board; 
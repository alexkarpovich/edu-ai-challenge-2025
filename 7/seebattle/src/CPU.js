import { Player } from './Player.js';

/**
 * Represents a CPU player with AI logic for the battleship game
 */
export class CPU extends Player {
  constructor(name = 'CPU', boardSize = 10) {
    super(name, boardSize);
    this.isHuman = false;
    this.mode = 'hunt'; // 'hunt' or 'target'
    this.targetQueue = [];
  }

  /**
   * Makes an AI-driven guess against the opponent
   * @param {Player} opponent - The opponent player
   * @returns {Object} - Result of the guess with AI decision info
   */
  makeGuess(opponent) {
    let guess;
    let attempts = 0;
    const maxAttempts = 100;

    // Keep trying until we find a valid guess
    while (attempts < maxAttempts) {
      attempts++;

      if (this.mode === 'target' && this.targetQueue.length > 0) {
        // Target mode: try locations around known hits
        guess = this.targetQueue.shift();
        
        // Skip if we've already guessed this location
        if (this.opponentBoard.getGuesses().has(guess)) {
          continue;
        }
      } else {
        // Hunt mode: make random guesses
        this.mode = 'hunt';
        guess = this.generateRandomGuess();
        
        // Skip if we've already guessed this location
        if (this.opponentBoard.getGuesses().has(guess)) {
          continue;
        }
      }

      // Make the actual guess
      const result = super.makeGuess(guess, opponent);
      
      if (result.success) {
        // Process the result for AI decision making
        if (result.hit) {
          if (result.sunk) {
            // Ship sunk: go back to hunt mode
            console.log(`CPU HIT at ${guess}!`);
            console.log('CPU sunk your battleship!');
            this.mode = 'hunt';
            this.targetQueue = [];
          } else {
            // Hit but not sunk: switch to target mode
            console.log(`CPU HIT at ${guess}!`);
            this.mode = 'target';
            this.addAdjacentTargets(guess);
          }
        } else {
          console.log(`CPU MISS at ${guess}.`);
          
          // If we were in target mode and missed, continue targeting if queue not empty
          if (this.mode === 'target' && this.targetQueue.length === 0) {
            this.mode = 'hunt';
          }
        }

        return {
          ...result,
          guess,
          mode: this.mode,
          queueLength: this.targetQueue.length
        };
      }
    }

    // Fallback - should rarely happen
    throw new Error('CPU could not make a valid guess after maximum attempts');
  }

  /**
   * Generates a random guess that hasn't been made yet
   * @returns {string} - Random guess location
   */
  generateRandomGuess() {
    const boardSize = this.opponentBoard.size;
    let guess;
    
    do {
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);
      guess = `${row}${col}`;
    } while (this.opponentBoard.getGuesses().has(guess));
    
    return guess;
  }

  /**
   * Adds adjacent locations to the target queue for a hit location
   * @param {string} hitLocation - The location that was hit
   */
  addAdjacentTargets(hitLocation) {
    const row = parseInt(hitLocation[0]);
    const col = parseInt(hitLocation[1]);
    const boardSize = this.opponentBoard.size;

    const adjacentLocations = [
      { r: row - 1, c: col }, // up
      { r: row + 1, c: col }, // down
      { r: row, c: col - 1 }, // left
      { r: row, c: col + 1 }  // right
    ];

    adjacentLocations.forEach(({ r, c }) => {
      // Check if location is valid and not already guessed
      if (this.isValidLocation(r, c)) {
        const locationStr = `${r}${c}`;
        
        if (!this.opponentBoard.getGuesses().has(locationStr) && 
            !this.targetQueue.includes(locationStr)) {
          this.targetQueue.push(locationStr);
        }
      }
    });
  }

  /**
   * Checks if a location is valid (within board bounds)
   * @param {number} row - Row coordinate
   * @param {number} col - Column coordinate
   * @returns {boolean} - True if location is valid
   */
  isValidLocation(row, col) {
    const boardSize = this.opponentBoard.size;
    return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
  }

  /**
   * Gets the current AI mode
   * @returns {string} - Current mode ('hunt' or 'target')
   */
  getCurrentMode() {
    return this.mode;
  }

  /**
   * Gets the current target queue length
   * @returns {number} - Number of targets in queue
   */
  getTargetQueueLength() {
    return this.targetQueue.length;
  }

  /**
   * Resets the CPU to hunt mode (useful for testing)
   */
  resetToHuntMode() {
    this.mode = 'hunt';
    this.targetQueue = [];
  }
} 
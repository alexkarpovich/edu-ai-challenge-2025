import { createInterface } from 'readline';
import Board from './Board.js';
import Player from './Player.js';
import CPUPlayer from './CPUPlayer.js';
import { GAME_CONFIG, GAME_MESSAGES } from '../utils/constants.js';
import { 
  displayBoards, 
  displayWelcome, 
  displayGameOver, 
  displayShipPlacement,
  displayTurnHeader,
  displayError,
  displaySuccess 
} from '../utils/display.js';

export class Game {
  constructor() {
    this.playerBoard = new Board();
    this.cpuBoard = new Board();
    this.player = new Player('Player', this.playerBoard);
    this.cpu = new CPUPlayer('CPU', this.cpuBoard);
    this.gameOver = false;
    this.rl = null;
  }

  /**
   * Initialize the game by setting up boards and placing ships
   */
  async initialize() {
    console.log('Setting up the game...');
    
    // Place ships on both boards
    this.playerBoard.placeShipsRandomly(GAME_CONFIG.NUM_SHIPS, GAME_CONFIG.SHIP_LENGTH, true);
    this.cpuBoard.placeShipsRandomly(GAME_CONFIG.NUM_SHIPS, GAME_CONFIG.SHIP_LENGTH, false);
    
    displayShipPlacement('Player', GAME_CONFIG.NUM_SHIPS);
    displayShipPlacement('CPU', GAME_CONFIG.NUM_SHIPS);
    
    console.log('Game setup complete!\n');
  }

  /**
   * Start the game and enter the main game loop
   */
  async start() {
    displayWelcome();
    await this.initialize();
    
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    await this.gameLoop();
  }

  /**
   * Main game loop
   */
  async gameLoop() {
    while (!this.gameOver) {
      // Check win conditions
      if (this.cpu.hasLost()) {
        this.endGame(true);
        break;
      }
      
      if (this.player.hasLost()) {
        this.endGame(false);
        break;
      }

      // Display current state
      displayBoards(this.cpuBoard, this.playerBoard);
      
      // Player turn
      const playerMadeValidMove = await this.playerTurn();
      
      if (!playerMadeValidMove) {
        continue; // Invalid input, try again
      }

      // Check if CPU lost after player's turn
      if (this.cpu.hasLost()) {
        this.endGame(true);
        break;
      }

      // CPU turn
      await this.cpuTurn();
      
      // Check if player lost after CPU's turn
      if (this.player.hasLost()) {
        this.endGame(false);
        break;
      }
    }
  }

  /**
   * Handle the player's turn
   * @returns {Promise<boolean>} - True if player made a valid move
   */
  async playerTurn() {
    return new Promise((resolve) => {
      this.rl.question('Enter your guess (e.g., 00): ', (answer) => {
        const result = this.player.makeGuess(answer, this.cpuBoard);
        
        if (!result.success) {
          displayError(result.message);
          resolve(false);
        } else {
          displaySuccess(result.message);
          resolve(true);
        }
      });
    });
  }

  /**
   * Handle the CPU's turn
   * @returns {Promise<void>}
   */
  async cpuTurn() {
    displayTurnHeader('CPU');
    
    // Add a small delay to make CPU turn visible
    await this.delay(1000);
    
    const result = this.cpu.makeGuess(this.playerBoard);
    // Result message is already logged by CPUPlayer class
  }

  /**
   * End the game and display results
   * @param {boolean} playerWon - True if player won
   */
  endGame(playerWon) {
    this.gameOver = true;
    displayBoards(this.cpuBoard, this.playerBoard);
    displayGameOver(playerWon);
    
    if (this.rl) {
      this.rl.close();
    }
  }

  /**
   * Add a delay (for better user experience)
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current game state (for testing)
   * @returns {object} - Current game state
   */
  getGameState() {
    return {
      playerShipsRemaining: this.player.getRemainingShips(),
      cpuShipsRemaining: this.cpu.getRemainingShips(),
      gameOver: this.gameOver,
      cpuMode: this.cpu.getMode(),
      playerGuesses: this.cpuBoard.getGuesses(),
      cpuGuesses: this.cpu.getGuesses()
    };
  }

  /**
   * Reset the game to initial state (for testing)
   */
  reset() {
    this.playerBoard = new Board();
    this.cpuBoard = new Board();
    this.player = new Player('Player', this.playerBoard);
    this.cpu = new CPUPlayer('CPU', this.cpuBoard);
    this.gameOver = false;
    
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.rl) {
      this.rl.close();
    }
  }
}

export default Game; 
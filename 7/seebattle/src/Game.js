import readline from 'readline';
import { Player } from './Player.js';
import { CPU } from './CPU.js';
import { GameDisplay } from './GameDisplay.js';

/**
 * Main game controller for the battleship game
 */
export class Game {
  constructor(boardSize = 10, numShips = 3, shipLength = 3) {
    this.boardSize = boardSize;
    this.numShips = numShips;
    this.shipLength = shipLength;
    
    this.player = null;
    this.cpu = null;
    this.gameOver = false;
    this.winner = null;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Initializes and starts the game
   */
  async start() {
    try {
      this.initializeGame();
      await this.gameLoop();
    } catch (error) {
      console.error('Game error:', error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Initializes the game by setting up players and their ships
   */
  initializeGame() {
    GameDisplay.printBoardsCreatedMessage();
    
    // Create players
    this.player = new Player('Player', this.boardSize);
    this.cpu = new CPU('CPU', this.boardSize);
    
    // Setup ships for both players
    this.player.setupShips(this.numShips, this.shipLength);
    GameDisplay.printShipSetupMessage('Player', this.numShips);
    
    this.cpu.setupShips(this.numShips, this.shipLength);
    GameDisplay.printShipSetupMessage('CPU', this.numShips);
    
    GameDisplay.printWelcomeMessage(this.numShips);
  }

  /**
   * Main game loop - alternates between player and CPU turns
   */
  async gameLoop() {
    while (!this.gameOver) {
      // Check for game over conditions
      if (this.checkGameOver()) {
        this.endGame();
        return;
      }

      // Display current state
      GameDisplay.printBoards(this.player);
      
      // Player's turn
      const playerMadeMove = await this.playerTurn();
      
      if (!playerMadeMove) {
        continue; // Invalid input, try again
      }

      // Check for game over after player's turn
      if (this.checkGameOver()) {
        this.endGame();
        return;
      }

      // CPU's turn
      this.cpuTurn();
      
      // Check for game over after CPU's turn
      if (this.checkGameOver()) {
        this.endGame();
        return;
      }
    }
  }

  /**
   * Handles the player's turn
   * @returns {Promise<boolean>} - True if player made a valid move
   */
  async playerTurn() {
    return new Promise((resolve) => {
      this.rl.question(GameDisplay.getInputPrompt(), (answer) => {
        const result = this.player.makeGuess(answer, this.cpu);
        
        if (!result.success) {
          GameDisplay.printError(result.error);
          resolve(false);
          return;
        }

        GameDisplay.printPlayerGuessResult(result, answer);
        resolve(true);
      });
    });
  }

  /**
   * Handles the CPU's turn
   */
  cpuTurn() {
    GameDisplay.printCPUTurnHeader();
    
    const result = this.cpu.makeGuess(this.player);
    
    // The CPU class already handles its own console output
    // So we don't need additional output here
  }

  /**
   * Checks if the game is over
   * @returns {boolean} - True if game is over
   */
  checkGameOver() {
    if (this.player.hasWon(this.cpu)) {
      this.winner = this.player;
      this.gameOver = true;
      return true;
    }
    
    if (this.cpu.hasWon(this.player)) {
      this.winner = this.cpu;
      this.gameOver = true;
      return true;
    }
    
    return false;
  }

  /**
   * Ends the game and displays final results
   */
  endGame() {
    const playerWon = this.winner === this.player;
    GameDisplay.printGameOverMessage(playerWon);
    GameDisplay.printBoards(this.player);
  }

  /**
   * Gets the current game state (useful for testing)
   * @returns {Object} - Current game state
   */
  getGameState() {
    return {
      gameOver: this.gameOver,
      winner: this.winner ? this.winner.name : null,
      playerShipsRemaining: this.player ? this.player.getRemainingShips() : 0,
      cpuShipsRemaining: this.cpu ? this.cpu.getRemainingShips() : 0,
      cpuMode: this.cpu ? this.cpu.getCurrentMode() : null
    };
  }

  /**
   * Simulates a player guess (useful for testing)
   * @param {string} guess - The guess to make
   * @returns {Object} - Result of the guess
   */
  simulatePlayerGuess(guess) {
    if (!this.player || !this.cpu) {
      throw new Error('Game not initialized');
    }
    
    return this.player.makeGuess(guess, this.cpu);
  }

  /**
   * Simulates a CPU turn (useful for testing)
   * @returns {Object} - Result of the CPU's guess
   */
  simulateCPUTurn() {
    if (!this.player || !this.cpu) {
      throw new Error('Game not initialized');
    }
    
    return this.cpu.makeGuess(this.player);
  }

  /**
   * Closes the readline interface
   */
  close() {
    this.rl.close();
  }
} 
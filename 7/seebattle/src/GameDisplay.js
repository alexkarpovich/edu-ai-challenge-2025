/**
 * Handles display and formatting for the battleship game
 */
export class GameDisplay {
  /**
   * Prints the game boards side by side (opponent tracking board and player's own board)
   * @param {Player} player - The human player
   */
  static printBoards(player) {
    const opponentBoard = player.getOpponentTrackingBoard();
    const playerBoard = player.getDisplayBoard(true); // Show ships on player's board
    const boardSize = opponentBoard.length;

    console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
    
    // Print header with column numbers
    let header = '  ';
    for (let h = 0; h < boardSize; h++) {
      header += h + ' ';
    }
    console.log(header + '     ' + header);

    // Print each row
    for (let i = 0; i < boardSize; i++) {
      let rowStr = i + ' ';

      // Opponent board (left side)
      for (let j = 0; j < boardSize; j++) {
        rowStr += opponentBoard[i][j] + ' ';
      }
      
      rowStr += '    ' + i + ' ';

      // Player board (right side)
      for (let j = 0; j < boardSize; j++) {
        rowStr += playerBoard[i][j] + ' ';
      }
      
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Prints a single board (for debugging or testing)
   * @param {string[][]} board - 2D array representing the board
   * @param {string} title - Title for the board
   */
  static printSingleBoard(board, title = 'Board') {
    console.log(`\n   --- ${title.toUpperCase()} ---`);
    
    const boardSize = board.length;
    let header = '  ';
    for (let h = 0; h < boardSize; h++) {
      header += h + ' ';
    }
    console.log(header);

    for (let i = 0; i < boardSize; i++) {
      let rowStr = i + ' ';
      for (let j = 0; j < boardSize; j++) {
        rowStr += board[i][j] + ' ';
      }
      console.log(rowStr);
    }
    console.log('\n');
  }

  /**
   * Prints the game welcome message
   * @param {number} numShips - Number of ships in the game
   */
  static printWelcomeMessage(numShips) {
    console.log("\nLet's play Sea Battle!");
    console.log(`Try to sink the ${numShips} enemy ships.`);
  }

  /**
   * Prints the game over message
   * @param {boolean} playerWon - True if player won, false if CPU won
   */
  static printGameOverMessage(playerWon) {
    if (playerWon) {
      console.log('\n*** CONGRATULATIONS! You sunk all enemy battleships! ***');
    } else {
      console.log('\n*** GAME OVER! The CPU sunk all your battleships! ***');
    }
  }

  /**
   * Prints ship setup completion message
   * @param {string} playerType - Type of player ('Player' or 'CPU')
   * @param {number} numShips - Number of ships placed
   */
  static printShipSetupMessage(playerType, numShips) {
    console.log(`${numShips} ships placed randomly for ${playerType}.`);
  }

  /**
   * Prints boards creation message
   */
  static printBoardsCreatedMessage() {
    console.log('Boards created.');
  }

  /**
   * Prints the CPU's turn header
   */
  static printCPUTurnHeader() {
    console.log("\n--- CPU's Turn ---");
  }

  /**
   * Prints player guess result
   * @param {Object} result - Result object from makeGuess
   * @param {string} guess - The guess that was made
   */
  static printPlayerGuessResult(result, guess) {
    if (result.hit) {
      console.log('PLAYER HIT!');
      if (result.sunk) {
        console.log('You sunk an enemy battleship!');
      }
    } else {
      console.log('PLAYER MISS.');
    }
  }

  /**
   * Prints error message for invalid input
   * @param {string} error - Error message to display
   */
  static printError(error) {
    console.log(`Oops, ${error}`);
  }

  /**
   * Prints current game status
   * @param {Player} player - Human player
   * @param {Player} cpu - CPU player
   */
  static printGameStatus(player, cpu) {
    console.log(`\nYour ships remaining: ${player.getRemainingShips()}`);
    console.log(`Enemy ships remaining: ${cpu.getRemainingShips()}`);
  }

  /**
   * Gets the prompt message for player input
   * @returns {string} - Input prompt message
   */
  static getInputPrompt() {
    return 'Enter your guess (e.g., 00): ';
  }
} 
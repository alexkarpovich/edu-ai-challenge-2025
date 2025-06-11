import { GAME_CONFIG } from './constants.js';

/**
 * Display the game boards side by side
 * @param {Board} opponentBoard - The CPU's board (hidden ships)
 * @param {Board} playerBoard - The player's board (shows ships)
 */
export function displayBoards(opponentBoard, playerBoard) {
  const opponentGrid = opponentBoard.getGrid();
  const playerGrid = playerBoard.getGrid();

  console.log('\n   --- OPPONENT BOARD ---          --- YOUR BOARD ---');
  
  // Print column headers
  let header = '  ';
  for (let h = 0; h < GAME_CONFIG.BOARD_SIZE; h++) {
    header += h + ' ';
  }
  console.log(header + '     ' + header);

  // Print rows
  for (let i = 0; i < GAME_CONFIG.BOARD_SIZE; i++) {
    let rowStr = i + ' ';

    // Opponent board (hide ships)
    for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
      const cell = opponentGrid[i][j];
      // Hide ships on opponent board - show only hits, misses, and empty
      const displayCell = cell === 'S' ? '~' : cell;
      rowStr += displayCell + ' ';
    }

    rowStr += '    ' + i + ' ';

    // Player board (show everything)
    for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
      rowStr += playerGrid[i][j] + ' ';
    }

    console.log(rowStr);
  }
  
  console.log('\n');
}

/**
 * Display a welcome message
 */
export function displayWelcome() {
  console.log("\n🚢 Welcome to Sea Battle! 🚢");
  console.log("===============================");
  console.log(`Try to sink the ${GAME_CONFIG.NUM_SHIPS} enemy ships.`);
  console.log("Enter coordinates like '00', '34', '98' etc.");
  console.log("Legend: ~ = Empty, S = Your Ship, X = Hit, O = Miss");
  console.log("===============================\n");
}

/**
 * Display game over message
 * @param {boolean} playerWon - True if player won, false if CPU won
 */
export function displayGameOver(playerWon) {
  console.log('\n' + '='.repeat(50));
  if (playerWon) {
    console.log('🎉 CONGRATULATIONS! You sunk all enemy battleships! 🎉');
  } else {
    console.log('💥 GAME OVER! The CPU sunk all your battleships! 💥');
  }
  console.log('='.repeat(50) + '\n');
}

/**
 * Display ship placement message
 * @param {string} playerType - Type of player (Player/CPU)
 * @param {number} numShips - Number of ships placed
 */
export function displayShipPlacement(playerType, numShips) {
  console.log(`${numShips} ships placed randomly for ${playerType}.`);
}

/**
 * Display turn header
 * @param {string} playerName - Name of the current player
 */
export function displayTurnHeader(playerName) {
  console.log(`\n--- ${playerName}'s Turn ---`);
}

/**
 * Display game statistics
 * @param {Player} player - The human player
 * @param {CPUPlayer} cpu - The CPU player
 */
export function displayGameStats(player, cpu) {
  console.log(`\n📊 Game Stats:`);
  console.log(`Your remaining ships: ${player.getRemainingShips()}`);
  console.log(`Enemy remaining ships: ${cpu.getRemainingShips()}`);
  console.log(`CPU is in ${cpu.getMode()} mode`);
}

/**
 * Clear the console (cross-platform)
 */
export function clearScreen() {
  console.clear();
}

/**
 * Display an error message
 * @param {string} message - Error message to display
 */
export function displayError(message) {
  console.log(`❌ ${message}`);
}

/**
 * Display a success message
 * @param {string} message - Success message to display
 */
export function displaySuccess(message) {
  console.log(`✅ ${message}`);
} 
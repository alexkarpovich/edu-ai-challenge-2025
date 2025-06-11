import { Game } from './Game.js';

/**
 * Main entry point for the Sea Battle game
 */
async function main() {
  const game = new Game(10, 3, 3); // 10x10 board, 3 ships, each 3 cells long
  await game.start();
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n\nGame interrupted. Thanks for playing Sea Battle!');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nGame terminated. Thanks for playing Sea Battle!');
  process.exit(0);
});

// Start the game
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 
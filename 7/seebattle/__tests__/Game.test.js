import { Game } from '../src/Game.js';

// Mock console methods to avoid cluttering test output
const originalConsole = {
  log: console.log,
  error: console.error
};

beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

describe('Game', () => {
  let game;

  beforeEach(() => {
    game = new Game(5, 2, 2); // Smaller game for testing
  });

  afterEach(() => {
    if (game) {
      game.close();
    }
  });

  describe('constructor', () => {
    test('should create game with correct parameters', () => {
      expect(game.boardSize).toBe(5);
      expect(game.numShips).toBe(2);
      expect(game.shipLength).toBe(2);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();
      expect(game.player).toBeNull();
      expect(game.cpu).toBeNull();
    });

    test('should create game with default parameters', () => {
      const defaultGame = new Game();
      expect(defaultGame.boardSize).toBe(10);
      expect(defaultGame.numShips).toBe(3);
      expect(defaultGame.shipLength).toBe(3);
      defaultGame.close();
    });
  });

  describe('initializeGame', () => {
    test('should initialize players and ships', () => {
      game.initializeGame();
      
      expect(game.player).toBeDefined();
      expect(game.cpu).toBeDefined();
      expect(game.player.name).toBe('Player');
      expect(game.cpu.name).toBe('CPU');
      
      // Check ships were placed
      expect(game.player.board.ships).toHaveLength(2);
      expect(game.cpu.board.ships).toHaveLength(2);
      
      // Check ship lengths
      game.player.board.ships.forEach(ship => {
        expect(ship.length).toBe(2);
      });
      game.cpu.board.ships.forEach(ship => {
        expect(ship.length).toBe(2);
      });
    });
  });

  describe('checkGameOver', () => {
    beforeEach(() => {
      game.initializeGame();
    });

    test('should return false when both players have ships', () => {
      expect(game.checkGameOver()).toBe(false);
      expect(game.gameOver).toBe(false);
      expect(game.winner).toBeNull();
    });

    test('should detect player victory', () => {
      // Sink all CPU ships
      game.cpu.board.ships.forEach(ship => {
        ship.locations.forEach(location => {
          game.cpu.board.processGuess(location);
        });
      });
      
      expect(game.checkGameOver()).toBe(true);
      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe(game.player);
    });

    test('should detect CPU victory', () => {
      // Sink all player ships
      game.player.board.ships.forEach(ship => {
        ship.locations.forEach(location => {
          game.player.board.processGuess(location);
        });
      });
      
      expect(game.checkGameOver()).toBe(true);
      expect(game.gameOver).toBe(true);
      expect(game.winner).toBe(game.cpu);
    });
  });

  describe('getGameState', () => {
    beforeEach(() => {
      game.initializeGame();
    });

    test('should return correct game state', () => {
      const state = game.getGameState();
      
      expect(state.gameOver).toBe(false);
      expect(state.winner).toBeNull();
      expect(state.playerShipsRemaining).toBe(2);
      expect(state.cpuShipsRemaining).toBe(2);
      expect(state.cpuMode).toBe('hunt');
    });

    test('should return correct state when game is over', () => {
      // End the game
      game.cpu.board.ships.forEach(ship => {
        ship.locations.forEach(location => {
          game.cpu.board.processGuess(location);
        });
      });
      game.checkGameOver();
      
      const state = game.getGameState();
      
      expect(state.gameOver).toBe(true);
      expect(state.winner).toBe('Player');
      expect(state.cpuShipsRemaining).toBe(0);
    });
  });

  describe('simulatePlayerGuess', () => {
    beforeEach(() => {
      game.initializeGame();
    });

    test('should throw error when game not initialized', () => {
      const uninitializedGame = new Game();
      expect(() => {
        uninitializedGame.simulatePlayerGuess('00');
      }).toThrow('Game not initialized');
      uninitializedGame.close();
    });

    test('should process valid player guess', () => {
      const result = game.simulatePlayerGuess('00');
      
      expect(result).toHaveProperty('success');
      if (result.success) {
        expect(result).toHaveProperty('hit');
        expect(result).toHaveProperty('sunk');
      }
    });

    test('should reject invalid guess', () => {
      const result = game.simulatePlayerGuess('invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should track player guesses', () => {
      game.simulatePlayerGuess('00');
      game.simulatePlayerGuess('11');
      
      const guesses = game.player.opponentBoard.getGuesses();
      expect(guesses.has('00')).toBe(true);
      expect(guesses.has('11')).toBe(true);
    });
  });

  describe('simulateCPUTurn', () => {
    beforeEach(() => {
      game.initializeGame();
    });

    test('should throw error when game not initialized', () => {
      const uninitializedGame = new Game();
      expect(() => {
        uninitializedGame.simulateCPUTurn();
      }).toThrow('Game not initialized');
      uninitializedGame.close();
    });

    test('should process CPU turn', () => {
      const result = game.simulateCPUTurn();
      
      expect(result.success).toBe(true);
      expect(result.guess).toHaveLength(2);
      expect(result).toHaveProperty('hit');
      expect(result).toHaveProperty('sunk');
      expect(result).toHaveProperty('mode');
    });

    test('should track CPU guesses', () => {
      const result = game.simulateCPUTurn();
      
      const guesses = game.cpu.opponentBoard.getGuesses();
      expect(guesses.has(result.guess)).toBe(true);
    });
  });

  describe('game flow simulation', () => {
    beforeEach(() => {
      game.initializeGame();
    });

    test('should handle complete game simulation', () => {
      let turns = 0;
      const maxTurns = 50;
      
      while (!game.checkGameOver() && turns < maxTurns) {
        // Player turn - try to find a valid guess
        let playerGuess = null;
        for (let row = 0; row < game.boardSize; row++) {
          for (let col = 0; col < game.boardSize; col++) {
            const guess = `${row}${col}`;
            if (!game.player.opponentBoard.getGuesses().has(guess)) {
              playerGuess = guess;
              break;
            }
          }
          if (playerGuess) break;
        }
        
        if (playerGuess) {
          game.simulatePlayerGuess(playerGuess);
        }
        
        if (game.checkGameOver()) break;
        
        // CPU turn
        game.simulateCPUTurn();
        
        turns++;
      }
      
      expect(turns).toBeLessThan(maxTurns);
      expect(game.gameOver).toBe(true);
      expect(game.winner).toBeDefined();
    });

    test('should maintain game state consistency', () => {
      // Make some moves
      game.simulatePlayerGuess('00');
      game.simulateCPUTurn();
      game.simulatePlayerGuess('11');
      game.simulateCPUTurn();
      
      const state = game.getGameState();
      
      // Verify state consistency
      expect(state.playerShipsRemaining).toBe(game.player.getRemainingShips());
      expect(state.cpuShipsRemaining).toBe(game.cpu.getRemainingShips());
      expect(state.cpuMode).toBe(game.cpu.getCurrentMode());
      
      // Verify guess tracking
      expect(game.player.opponentBoard.getGuesses().size).toBeGreaterThanOrEqual(2);
      expect(game.cpu.opponentBoard.getGuesses().size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('error handling', () => {
    test('should handle initialization errors gracefully', () => {
      // Create a game with impossible parameters
      const impossibleGame = new Game(2, 10, 5);
      
      expect(() => {
        impossibleGame.initializeGame();
      }).toThrow();
      
      impossibleGame.close();
    });

    test('should handle repeated guesses', () => {
      game.initializeGame();
      
      const firstResult = game.simulatePlayerGuess('00');
      const secondResult = game.simulatePlayerGuess('00');
      
      if (firstResult.success) {
        expect(secondResult.success).toBe(false);
        expect(secondResult.error).toContain('already guessed');
      }
    });
  });

  describe('AI behavior verification', () => {
    beforeEach(() => {
      game.initializeGame();
    });

    test('should demonstrate AI mode switching', () => {
      let hitMade = false;
      let targetModeObserved = false;
      
      // Keep making CPU moves until we see target mode
      for (let i = 0; i < 25 && !targetModeObserved; i++) {
        const result = game.simulateCPUTurn();
        
        if (result.hit && !result.sunk) {
          hitMade = true;
          expect(game.cpu.getCurrentMode()).toBe('target');
          targetModeObserved = true;
        }
        
        if (game.checkGameOver()) break;
      }
      
      // If we made a hit, we should have observed target mode
      if (hitMade) {
        expect(targetModeObserved).toBe(true);
      }
    });
  });
}); 
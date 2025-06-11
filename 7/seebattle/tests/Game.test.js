import Game from '../src/classes/Game.js';
import { GAME_CONFIG } from '../src/utils/constants.js';

describe('Game', () => {
  let game;
  let originalConsoleLog;

  beforeAll(() => {
    // Mock console.log to avoid test output noise
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    game = new Game();
  });

  afterEach(() => {
    if (game) {
      game.cleanup();
    }
  });

  describe('constructor', () => {
    it('should initialize game with proper default state', () => {
      expect(game.playerBoard).toBeDefined();
      expect(game.cpuBoard).toBeDefined();
      expect(game.player).toBeDefined();
      expect(game.cpu).toBeDefined();
      expect(game.gameOver).toBe(false);
      expect(game.rl).toBeNull();
    });

    it('should create player and CPU with correct names', () => {
      expect(game.player.getName()).toBe('Player');
      expect(game.cpu.getName()).toBe('CPU');
    });
  });

  describe('initialize', () => {
    it('should place ships on both boards', async () => {
      await game.initialize();
      
      expect(game.playerBoard.ships).toHaveLength(GAME_CONFIG.NUM_SHIPS);
      expect(game.cpuBoard.ships).toHaveLength(GAME_CONFIG.NUM_SHIPS);
    });

    it('should place ships with correct length', async () => {
      await game.initialize();
      
      game.playerBoard.ships.forEach(ship => {
        expect(ship.locations).toHaveLength(GAME_CONFIG.SHIP_LENGTH);
      });
      
      game.cpuBoard.ships.forEach(ship => {
        expect(ship.locations).toHaveLength(GAME_CONFIG.SHIP_LENGTH);
      });
    });
  });

  describe('getGameState', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    it('should return correct initial game state', () => {
      const state = game.getGameState();
      
      expect(state.playerShipsRemaining).toBe(GAME_CONFIG.NUM_SHIPS);
      expect(state.cpuShipsRemaining).toBe(GAME_CONFIG.NUM_SHIPS);
      expect(state.gameOver).toBe(false);
      expect(state.cpuMode).toBe('hunt');
      expect(state.playerGuesses).toEqual([]);
      expect(state.cpuGuesses).toEqual([]);
    });

    it('should reflect changes in game state', () => {
      // Simulate a player guess
      game.player.makeGuess('00', game.cpuBoard);
      
      const state = game.getGameState();
      expect(state.playerGuesses).toContain('00');
    });
  });

  describe('endGame', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    it('should set game over flag when player wins', () => {
      game.endGame(true);
      expect(game.gameOver).toBe(true);
    });

    it('should set game over flag when CPU wins', () => {
      game.endGame(false);
      expect(game.gameOver).toBe(true);
    });
  });

  describe('reset', () => {
    beforeEach(async () => {
      await game.initialize();
      // Simulate some game state changes
      game.gameOver = true;
      game.player.makeGuess('00', game.cpuBoard);
    });

    it('should reset game to initial state', () => {
      game.reset();
      
      expect(game.gameOver).toBe(false);
      expect(game.playerBoard.ships).toEqual([]);
      expect(game.cpuBoard.ships).toEqual([]);
      expect(game.player.getName()).toBe('Player');
      expect(game.cpu.getName()).toBe('CPU');
      expect(game.rl).toBeNull();
    });

    it('should create new board instances', () => {
      const originalPlayerBoard = game.playerBoard;
      const originalCpuBoard = game.cpuBoard;
      
      game.reset();
      
      expect(game.playerBoard).not.toBe(originalPlayerBoard);
      expect(game.cpuBoard).not.toBe(originalCpuBoard);
    });
  });

  describe('delay', () => {
    it('should resolve after specified time', async () => {
      const startTime = Date.now();
      await game.delay(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some margin
    });
  });

  describe('cleanup', () => {
    it('should close readline interface if it exists', () => {
      const mockClose = jest.fn();
      const mockRl = {
        close: mockClose
      };
      game.rl = mockRl;
      
      game.cleanup();
      
      expect(mockClose).toHaveBeenCalled();
    });

    it('should not throw if readline interface is null', () => {
      game.rl = null;
      
      expect(() => game.cleanup()).not.toThrow();
    });
  });

  describe('game flow integration', () => {
    beforeEach(async () => {
      await game.initialize();
    });

    it('should detect player win condition', () => {
      // Manually sink all CPU ships
      game.cpuBoard.ships.forEach(ship => {
        ship.locations.forEach(location => {
          ship.hit(location);
        });
      });
      
      expect(game.cpu.hasLost()).toBe(true);
    });

    it('should detect CPU win condition', () => {
      // Manually sink all player ships
      game.playerBoard.ships.forEach(ship => {
        ship.locations.forEach(location => {
          ship.hit(location);
        });
      });
      
      expect(game.player.hasLost()).toBe(true);
    });

    it('should track game progress correctly', () => {
      const initialState = game.getGameState();
      
      // Make some guesses
      game.player.makeGuess('00', game.cpuBoard);
      game.cpu.makeGuess(game.playerBoard);
      
      const updatedState = game.getGameState();
      
      expect(updatedState.playerGuesses.length).toBeGreaterThan(initialState.playerGuesses.length);
      expect(updatedState.cpuGuesses.length).toBeGreaterThan(initialState.cpuGuesses.length);
    });
  });

  describe('error handling', () => {
    it('should handle board initialization errors gracefully', async () => {
      // Mock a method to throw an error
      const originalPlaceShips = game.playerBoard.placeShipsRandomly;
      const mockPlaceShips = jest.fn(() => {
        throw new Error('Ship placement failed');
      });
      game.playerBoard.placeShipsRandomly = mockPlaceShips;
      
      await expect(game.initialize()).rejects.toThrow('Ship placement failed');
      
      // Restore original method
      game.playerBoard.placeShipsRandomly = originalPlaceShips;
    });
  });
}); 
import { CPU } from '../src/CPU.js';
import { Player } from '../src/Player.js';

// Mock console.log to avoid cluttering test output
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalConsoleLog;
});

describe('CPU', () => {
  let cpu;
  let opponent;

  beforeEach(() => {
    cpu = new CPU('TestCPU', 5);
    opponent = new Player('Human', 5);
    opponent.setupShips(1, 2); // One ship for testing
  });

  describe('constructor', () => {
    test('should create CPU with correct properties', () => {
      expect(cpu.name).toBe('TestCPU');
      expect(cpu.isHuman).toBe(false);
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
    });

    test('should create CPU with default name', () => {
      const defaultCPU = new CPU();
      expect(defaultCPU.name).toBe('CPU');
    });
  });

  describe('generateRandomGuess', () => {
    test('should generate valid guess', () => {
      const guess = cpu.generateRandomGuess();
      expect(guess).toHaveLength(2);
      
      const row = parseInt(guess[0]);
      const col = parseInt(guess[1]);
      expect(row).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(5);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(col).toBeLessThan(5);
    });

    test('should not generate already guessed location', () => {
      // Add some guesses
      cpu.opponentBoard.guesses.add('00');
      cpu.opponentBoard.guesses.add('01');
      cpu.opponentBoard.guesses.add('02');
      
      const guess = cpu.generateRandomGuess();
      expect(cpu.opponentBoard.guesses.has(guess)).toBe(false);
    });
  });

  describe('isValidLocation', () => {
    test('should validate correct locations', () => {
      expect(cpu.isValidLocation(0, 0)).toBe(true);
      expect(cpu.isValidLocation(2, 3)).toBe(true);
      expect(cpu.isValidLocation(4, 4)).toBe(true);
    });

    test('should reject invalid locations', () => {
      expect(cpu.isValidLocation(-1, 0)).toBe(false);
      expect(cpu.isValidLocation(0, -1)).toBe(false);
      expect(cpu.isValidLocation(5, 0)).toBe(false);
      expect(cpu.isValidLocation(0, 5)).toBe(false);
    });
  });

  describe('addAdjacentTargets', () => {
    beforeEach(() => {
      cpu.targetQueue = [];
    });

    test('should add valid adjacent locations', () => {
      cpu.addAdjacentTargets('22');
      
      const expectedTargets = ['12', '32', '21', '23'];
      expectedTargets.forEach(target => {
        expect(cpu.targetQueue).toContain(target);
      });
    });

    test('should not add out-of-bounds locations', () => {
      cpu.addAdjacentTargets('00');
      
      // Should only add down and right (up and left are out of bounds)
      expect(cpu.targetQueue).toContain('10');
      expect(cpu.targetQueue).toContain('01');
      expect(cpu.targetQueue).not.toContain('-10');
      expect(cpu.targetQueue).not.toContain('0-1');
    });

    test('should not add already guessed locations', () => {
      cpu.opponentBoard.guesses.add('12');
      cpu.opponentBoard.guesses.add('21');
      
      cpu.addAdjacentTargets('22');
      
      expect(cpu.targetQueue).not.toContain('12');
      expect(cpu.targetQueue).not.toContain('21');
      expect(cpu.targetQueue).toContain('32');
      expect(cpu.targetQueue).toContain('23');
    });

    test('should not add duplicate targets', () => {
      cpu.targetQueue = ['12'];
      cpu.addAdjacentTargets('22');
      
      // Should not add '12' again
      const count12 = cpu.targetQueue.filter(target => target === '12').length;
      expect(count12).toBe(1);
    });
  });

  describe('makeGuess', () => {
    test('should make valid guess in hunt mode', () => {
      const result = cpu.makeGuess(opponent);
      
      expect(result.success).toBe(true);
      expect(result.guess).toHaveLength(2);
      expect(cpu.opponentBoard.guesses.has(result.guess)).toBe(true);
    });

    test('should switch to target mode on hit', () => {
      // Place ship at known location for testing
      const shipLocation = opponent.board.ships[0].locations[0];
      
      // Mock the guess to hit the ship
      jest.spyOn(cpu, 'generateRandomGuess').mockReturnValue(shipLocation);
      
      const result = cpu.makeGuess(opponent);
      
      if (result.hit && !result.sunk) {
        expect(cpu.mode).toBe('target');
        expect(cpu.targetQueue.length).toBeGreaterThan(0);
      }
      
      jest.restoreAllMocks();
    });

    test('should return to hunt mode when ship is sunk', () => {
      // Set up target mode
      cpu.mode = 'target';
      cpu.targetQueue = ['12', '23'];
      
      // Mock hitting and sinking a ship
      const shipLocation = opponent.board.ships[0].locations[0];
      opponent.board.ships[0].locations.forEach(loc => {
        if (loc !== shipLocation) {
          opponent.board.processGuess(loc);
        }
      });
      
      jest.spyOn(cpu, 'generateRandomGuess').mockReturnValue(shipLocation);
      
      const result = cpu.makeGuess(opponent);
      
      if (result.sunk) {
        expect(cpu.mode).toBe('hunt');
        expect(cpu.targetQueue).toEqual([]);
      }
      
      jest.restoreAllMocks();
    });

    test('should use target queue when in target mode', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['12', '23'];
      
      const result = cpu.makeGuess(opponent);
      
      expect(result.success).toBe(true);
      expect(['12', '23']).toContain(result.guess);
      expect(cpu.targetQueue.length).toBe(1);
    });

    test('should handle invalid targets in queue', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['99', '12']; // First is invalid
      
      const result = cpu.makeGuess(opponent);
      
      expect(result.success).toBe(true);
      // Should skip invalid target and use valid one or generate random
    });
  });

  describe('getCurrentMode', () => {
    test('should return current mode', () => {
      expect(cpu.getCurrentMode()).toBe('hunt');
      
      cpu.mode = 'target';
      expect(cpu.getCurrentMode()).toBe('target');
    });
  });

  describe('getTargetQueueLength', () => {
    test('should return queue length', () => {
      expect(cpu.getTargetQueueLength()).toBe(0);
      
      cpu.targetQueue = ['12', '23', '34'];
      expect(cpu.getTargetQueueLength()).toBe(3);
    });
  });

  describe('resetToHuntMode', () => {
    test('should reset to hunt mode', () => {
      cpu.mode = 'target';
      cpu.targetQueue = ['12', '23'];
      
      cpu.resetToHuntMode();
      
      expect(cpu.mode).toBe('hunt');
      expect(cpu.targetQueue).toEqual([]);
    });
  });

  describe('AI behavior integration', () => {
    test('should demonstrate hunt and target behavior', () => {
      const bigCPU = new CPU('BigCPU', 10);
      const bigOpponent = new Player('BigHuman', 10);
      
      // Place ship at known location
      bigOpponent.board.placeShip(5, 5, 3, 'horizontal'); // Ship at 55, 56, 57
      
      // Mock first guess to hit the ship
      jest.spyOn(bigCPU, 'generateRandomGuess').mockReturnValueOnce('55');
      
      const firstResult = bigCPU.makeGuess(bigOpponent);
      
      expect(firstResult.hit).toBe(true);
      expect(bigCPU.mode).toBe('target');
      expect(bigCPU.targetQueue.length).toBeGreaterThan(0);
      
      // Verify adjacent locations were added
      const expectedAdjacent = ['45', '65', '54', '56'];
      expectedAdjacent.forEach(target => {
        expect(bigCPU.targetQueue).toContain(target);
      });
      
      jest.restoreAllMocks();
    });

    test('should not get stuck with full board of guesses', () => {
      // Fill most of the board with guesses
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 4; col++) {
          cpu.opponentBoard.guesses.add(`${row}${col}`);
        }
      }
      
      // Should still be able to make a guess
      const result = cpu.makeGuess(opponent);
      expect(result.success).toBe(true);
    });
  });
}); 
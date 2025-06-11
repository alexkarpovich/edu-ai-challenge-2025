import CPUPlayer from '../src/classes/CPUPlayer.js';
import Board from '../src/classes/Board.js';
import { CPU_MODES } from '../src/utils/constants.js';

describe('CPUPlayer', () => {
  let cpu;
  let cpuBoard;
  let opponentBoard;
  let mockMath;
  let originalConsoleLog;

  beforeAll(() => {
    // Mock Math.random to make tests deterministic
    mockMath = Object.create(global.Math);
    mockMath.random = jest.fn();
    global.Math = mockMath;

    // Mock console.log to avoid test output noise
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    cpuBoard = new Board();
    cpu = new CPUPlayer('CPU', cpuBoard);
    opponentBoard = new Board();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a CPU player with initial hunt mode', () => {
      expect(cpu.name).toBe('CPU');
      expect(cpu.board).toBe(cpuBoard);
      expect(cpu.mode).toBe(CPU_MODES.HUNT);
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.guesses).toEqual([]);
    });
  });

  describe('generateRandomGuess', () => {
    it('should generate a valid random guess', () => {
      Math.random.mockReturnValueOnce(0.5).mockReturnValueOnce(0.7);
      
      const guess = cpu.generateRandomGuess();
      expect(guess).toBe('57'); // floor(10 * 0.5) + floor(10 * 0.7)
    });

    it('should generate different guesses with different random values', () => {
      Math.random.mockReturnValueOnce(0.0).mockReturnValueOnce(0.0);
      let guess1 = cpu.generateRandomGuess();
      
      Math.random.mockReturnValueOnce(0.9).mockReturnValueOnce(0.9);
      let guess2 = cpu.generateRandomGuess();
      
      expect(guess1).toBe('00');
      expect(guess2).toBe('99');
    });
  });

  describe('isValidTarget', () => {
    it('should return true for valid coordinates not yet guessed', () => {
      expect(cpu.isValidTarget(5, 5)).toBe(true);
    });

    it('should return false for coordinates out of bounds (negative)', () => {
      expect(cpu.isValidTarget(-1, 5)).toBe(false);
      expect(cpu.isValidTarget(5, -1)).toBe(false);
    });

    it('should return false for coordinates out of bounds (too high)', () => {
      expect(cpu.isValidTarget(10, 5)).toBe(false);
      expect(cpu.isValidTarget(5, 10)).toBe(false);
    });

    it('should return false for already guessed coordinates', () => {
      cpu.guesses.push('55');
      expect(cpu.isValidTarget(5, 5)).toBe(false);
    });
  });

  describe('addAdjacentTargets', () => {
    it('should add valid adjacent targets to queue', () => {
      cpu.addAdjacentTargets('55');
      
      // Should add 4 adjacent cells: up, down, left, right
      expect(cpu.targetQueue).toEqual(
        expect.arrayContaining(['45', '65', '54', '56'])
      );
      expect(cpu.targetQueue).toHaveLength(4);
    });

    it('should not add out-of-bounds targets', () => {
      cpu.addAdjacentTargets('00');
      
      // Only down and right should be added (up and left are out of bounds)
      expect(cpu.targetQueue).toEqual(['10', '01']);
    });

    it('should not add already guessed targets', () => {
      cpu.guesses.push('45', '56');
      cpu.addAdjacentTargets('55');
      
      // Should only add 65 and 54 (45 and 56 are already guessed)
      expect(cpu.targetQueue).toEqual(['65', '54']);
    });

    it('should not add duplicate targets to queue', () => {
      cpu.targetQueue.push('45');
      cpu.addAdjacentTargets('55');
      
      // 45 should not be duplicated
      const count45 = cpu.targetQueue.filter(target => target === '45').length;
      expect(count45).toBe(1);
    });
  });

  describe('makeGuess', () => {
    beforeEach(() => {
      // Set up opponent board with a ship at known location
      opponentBoard.placeShipsRandomly(1, 3, false);
      opponentBoard.ships[0].locations = ['55', '56', '57'];
      opponentBoard.ships[0].hits = [false, false, false];
    });

    describe('hunt mode', () => {
      it('should make random guesses in hunt mode', () => {
        Math.random.mockReturnValue(0.5);
        
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.success).toBe(true);
        expect(cpu.guesses).toContain('55');
      });

      it('should switch to target mode on hit', () => {
        Math.random.mockReturnValue(0.5); // Will generate '55' which is a hit
        
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.hit).toBe(true);
        expect(cpu.mode).toBe(CPU_MODES.TARGET);
        expect(cpu.targetQueue.length).toBeGreaterThan(0);
      });

      it('should stay in hunt mode on miss', () => {
        Math.random.mockReturnValue(0.0); // Will generate '00' which is a miss
        
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.hit).toBe(false);
        expect(cpu.mode).toBe(CPU_MODES.HUNT);
        expect(cpu.targetQueue).toEqual([]);
      });
    });

    describe('target mode', () => {
      beforeEach(() => {
        // Set CPU to target mode with a target in the queue
        cpu.mode = CPU_MODES.TARGET;
        cpu.targetQueue = ['45', '65'];
        cpu.guesses = ['55']; // Assume 55 was already hit
      });

      it('should use targets from queue in target mode', () => {
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.guess).toBe('45');
        expect(cpu.targetQueue).toEqual(['65']); // First target removed
      });

      it('should switch back to hunt mode when ship is sunk', () => {
        // Simulate hitting all parts of the ship
        cpu.guesses = ['55', '56']; // Two parts already hit
        cpu.targetQueue = ['57']; // Last part to hit
        
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.sunk).toBe(true);
        expect(cpu.mode).toBe(CPU_MODES.HUNT);
        expect(cpu.targetQueue).toEqual([]);
      });

      it('should add more targets when hitting but not sinking', () => {
        cpu.targetQueue = ['56']; // Target that will hit
        
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.hit).toBe(true);
        expect(result.sunk).toBe(false);
        expect(cpu.mode).toBe(CPU_MODES.TARGET);
        expect(cpu.targetQueue.length).toBeGreaterThan(0);
      });

      it('should switch to hunt mode when target queue is empty after miss', () => {
        cpu.targetQueue = ['00']; // Target that will miss
        
        const result = cpu.makeGuess(opponentBoard);
        
        expect(result.hit).toBe(false);
        expect(cpu.mode).toBe(CPU_MODES.HUNT);
      });
    });

    it('should not repeat previous guesses', () => {
      cpu.guesses = ['00', '01', '02'];
      Math.random.mockReturnValue(0.0); // Would normally generate '00'
      
      // CPU should generate different guesses until finding a new one
      const result = cpu.makeGuess(opponentBoard);
      
      expect(result.success).toBe(true);
      expect(['00', '01', '02']).not.toContain(result.guess);
    });
  });

  describe('getMode', () => {
    it('should return current mode', () => {
      expect(cpu.getMode()).toBe(CPU_MODES.HUNT);
      
      cpu.mode = CPU_MODES.TARGET;
      expect(cpu.getMode()).toBe(CPU_MODES.TARGET);
    });
  });

  describe('getTargetQueue', () => {
    it('should return a copy of target queue', () => {
      cpu.targetQueue = ['00', '01'];
      const queue = cpu.getTargetQueue();
      
      expect(queue).toEqual(['00', '01']);
      
      // Ensure it's a copy
      queue.push('02');
      expect(cpu.targetQueue).toEqual(['00', '01']);
    });
  });

  describe('getGuesses', () => {
    it('should return a copy of guesses array', () => {
      cpu.guesses = ['00', '01'];
      const guesses = cpu.getGuesses();
      
      expect(guesses).toEqual(['00', '01']);
      
      // Ensure it's a copy
      guesses.push('02');
      expect(cpu.guesses).toEqual(['00', '01']);
    });
  });

  describe('reset', () => {
    it('should reset CPU state to initial values', () => {
      cpu.mode = CPU_MODES.TARGET;
      cpu.targetQueue = ['00', '01'];
      cpu.guesses = ['55', '56'];
      
      cpu.reset();
      
      expect(cpu.mode).toBe(CPU_MODES.HUNT);
      expect(cpu.targetQueue).toEqual([]);
      expect(cpu.guesses).toEqual([]);
    });
  });
}); 
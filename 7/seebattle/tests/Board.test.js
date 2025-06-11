import Board from '../src/classes/Board.js';
import { GAME_CONFIG, CELL_STATES, SHIP_ORIENTATIONS } from '../src/utils/constants.js';

describe('Board', () => {
  let board;
  let mockMath;

  beforeAll(() => {
    // Mock Math.random to make tests deterministic
    mockMath = Object.create(global.Math);
    mockMath.random = jest.fn();
    global.Math = mockMath;
  });

  beforeEach(() => {
    board = new Board();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a board with correct size', () => {
      expect(board.size).toBe(GAME_CONFIG.BOARD_SIZE);
      expect(board.grid).toHaveLength(GAME_CONFIG.BOARD_SIZE);
      expect(board.grid[0]).toHaveLength(GAME_CONFIG.BOARD_SIZE);
    });

    it('should initialize with empty cells', () => {
      const grid = board.getGrid();
      for (let i = 0; i < GAME_CONFIG.BOARD_SIZE; i++) {
        for (let j = 0; j < GAME_CONFIG.BOARD_SIZE; j++) {
          expect(grid[i][j]).toBe(CELL_STATES.EMPTY);
        }
      }
    });

    it('should initialize with empty ships and guesses arrays', () => {
      expect(board.ships).toEqual([]);
      expect(board.guesses).toEqual([]);
    });
  });

  describe('createEmptyGrid', () => {
    it('should create a grid filled with empty cells', () => {
      const grid = board.createEmptyGrid();
      expect(grid).toHaveLength(GAME_CONFIG.BOARD_SIZE);
      expect(grid[0]).toHaveLength(GAME_CONFIG.BOARD_SIZE);
      
      for (let row of grid) {
        for (let cell of row) {
          expect(cell).toBe(CELL_STATES.EMPTY);
        }
      }
    });
  });

  describe('getRandomStartPosition', () => {
    it('should return valid horizontal position', () => {
      Math.random.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
      
      const position = board.getRandomStartPosition(SHIP_ORIENTATIONS.HORIZONTAL, 3);
      expect(position.startRow).toBe(5);
      expect(position.startCol).toBe(4); // (10-3+1) * 0.5 = 4
    });

    it('should return valid vertical position', () => {
      Math.random.mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
      
      const position = board.getRandomStartPosition(SHIP_ORIENTATIONS.VERTICAL, 3);
      expect(position.startRow).toBe(4); // (10-3+1) * 0.5 = 4
      expect(position.startCol).toBe(5);
    });
  });

  describe('canPlaceShip', () => {
    it('should return true for valid horizontal placement', () => {
      const canPlace = board.canPlaceShip(0, 0, SHIP_ORIENTATIONS.HORIZONTAL, 3);
      expect(canPlace).toBe(true);
    });

    it('should return true for valid vertical placement', () => {
      const canPlace = board.canPlaceShip(0, 0, SHIP_ORIENTATIONS.VERTICAL, 3);
      expect(canPlace).toBe(true);
    });

    it('should return false for horizontal placement that goes out of bounds', () => {
      const canPlace = board.canPlaceShip(0, 8, SHIP_ORIENTATIONS.HORIZONTAL, 3);
      expect(canPlace).toBe(false);
    });

    it('should return false for vertical placement that goes out of bounds', () => {
      const canPlace = board.canPlaceShip(8, 0, SHIP_ORIENTATIONS.VERTICAL, 3);
      expect(canPlace).toBe(false);
    });

    it('should return false if position is already occupied', () => {
      board.grid[0][0] = CELL_STATES.SHIP;
      const canPlace = board.canPlaceShip(0, 0, SHIP_ORIENTATIONS.HORIZONTAL, 3);
      expect(canPlace).toBe(false);
    });
  });

  describe('getShipLocations', () => {
    it('should return correct locations for horizontal ship', () => {
      const locations = board.getShipLocations(0, 0, SHIP_ORIENTATIONS.HORIZONTAL, 3);
      expect(locations).toEqual(['00', '01', '02']);
    });

    it('should return correct locations for vertical ship', () => {
      const locations = board.getShipLocations(0, 0, SHIP_ORIENTATIONS.VERTICAL, 3);
      expect(locations).toEqual(['00', '10', '20']);
    });
  });

  describe('markShipOnGrid', () => {
    it('should mark ship locations on the grid', () => {
      const locations = ['00', '01', '02'];
      board.markShipOnGrid(locations);
      
      expect(board.grid[0][0]).toBe(CELL_STATES.SHIP);
      expect(board.grid[0][1]).toBe(CELL_STATES.SHIP);
      expect(board.grid[0][2]).toBe(CELL_STATES.SHIP);
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      // Place a ship at locations ['00', '01', '02']
      board.placeShipsRandomly(1, 3, false);
      // Manually set the ship to known locations for testing
      board.ships[0].locations = ['00', '01', '02'];
      board.ships[0].hits = [false, false, false];
    });

    it('should return already guessed if location was guessed before', () => {
      board.guesses.push('00');
      const result = board.processGuess('00');
      
      expect(result.alreadyGuessed).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });

    it('should register a hit on ship', () => {
      const result = board.processGuess('00');
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.alreadyGuessed).toBe(false);
      expect(board.grid[0][0]).toBe(CELL_STATES.HIT);
    });

    it('should register a miss', () => {
      const result = board.processGuess('99');
      
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.alreadyGuessed).toBe(false);
      expect(board.grid[9][9]).toBe(CELL_STATES.MISS);
    });

    it('should detect when ship is sunk', () => {
      board.processGuess('00');
      board.processGuess('01');
      const result = board.processGuess('02');
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.alreadyGuessed).toBe(false);
    });
  });

  describe('areAllShipsSunk', () => {
    beforeEach(() => {
      board.placeShipsRandomly(2, 3, false);
      // Set known locations for testing
      board.ships[0].locations = ['00', '01', '02'];
      board.ships[1].locations = ['30', '31', '32'];
    });

    it('should return false when not all ships are sunk', () => {
      board.processGuess('00');
      expect(board.areAllShipsSunk()).toBe(false);
    });

    it('should return true when all ships are sunk', () => {
      // Sink first ship
      board.processGuess('00');
      board.processGuess('01');
      board.processGuess('02');
      
      // Sink second ship
      board.processGuess('30');
      board.processGuess('31');
      board.processGuess('32');
      
      expect(board.areAllShipsSunk()).toBe(true);
    });
  });

  describe('getGrid', () => {
    it('should return a copy of the grid', () => {
      const grid = board.getGrid();
      expect(grid).toEqual(board.grid);
      
      // Ensure it's a copy
      grid[0][0] = 'X';
      expect(board.grid[0][0]).toBe(CELL_STATES.EMPTY);
    });
  });

  describe('getGuesses', () => {
    it('should return a copy of guesses array', () => {
      board.processGuess('00');
      const guesses = board.getGuesses();
      
      expect(guesses).toEqual(['00']);
      
      // Ensure it's a copy
      guesses.push('01');
      expect(board.guesses).toEqual(['00']);
    });
  });

  describe('getRemainingShipCount', () => {
    beforeEach(() => {
      board.placeShipsRandomly(2, 3, false);
      board.ships[0].locations = ['00', '01', '02'];
      board.ships[1].locations = ['30', '31', '32'];
    });

    it('should return correct count when no ships are sunk', () => {
      expect(board.getRemainingShipCount()).toBe(2);
    });

    it('should return correct count when some ships are sunk', () => {
      // Sink one ship
      board.processGuess('00');
      board.processGuess('01');
      board.processGuess('02');
      
      expect(board.getRemainingShipCount()).toBe(1);
    });

    it('should return 0 when all ships are sunk', () => {
      // Sink all ships
      board.processGuess('00');
      board.processGuess('01');
      board.processGuess('02');
      board.processGuess('30');
      board.processGuess('31');
      board.processGuess('32');
      
      expect(board.getRemainingShipCount()).toBe(0);
    });
  });
}); 
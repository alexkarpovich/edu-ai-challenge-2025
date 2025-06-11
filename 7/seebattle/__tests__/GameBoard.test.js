import { GameBoard } from '../src/GameBoard.js';

describe('GameBoard', () => {
  let board;

  beforeEach(() => {
    board = new GameBoard(5); // Use smaller board for easier testing
  });

  describe('constructor', () => {
    test('should create a board with correct size', () => {
      expect(board.size).toBe(5);
      expect(board.grid).toHaveLength(5);
      expect(board.grid[0]).toHaveLength(5);
      expect(board.ships).toEqual([]);
      expect(board.guesses).toEqual(new Set());
    });

    test('should create default 10x10 board', () => {
      const defaultBoard = new GameBoard();
      expect(defaultBoard.size).toBe(10);
      expect(defaultBoard.grid).toHaveLength(10);
    });
  });

  describe('createEmptyGrid', () => {
    test('should create grid filled with water', () => {
      const grid = board.createEmptyGrid();
      expect(grid).toHaveLength(5);
      grid.forEach(row => {
        expect(row).toHaveLength(5);
        row.forEach(cell => {
          expect(cell).toBe('~');
        });
      });
    });
  });

  describe('getRandomStartPosition', () => {
    test('should return valid horizontal position', () => {
      const { startRow, startCol } = board.getRandomStartPosition(3, 'horizontal');
      expect(startRow).toBeGreaterThanOrEqual(0);
      expect(startRow).toBeLessThan(5);
      expect(startCol).toBeGreaterThanOrEqual(0);
      expect(startCol).toBeLessThanOrEqual(2); // 5 - 3 = 2
    });

    test('should return valid vertical position', () => {
      const { startRow, startCol } = board.getRandomStartPosition(3, 'vertical');
      expect(startRow).toBeGreaterThanOrEqual(0);
      expect(startRow).toBeLessThanOrEqual(2); // 5 - 3 = 2
      expect(startCol).toBeGreaterThanOrEqual(0);
      expect(startCol).toBeLessThan(5);
    });
  });

  describe('canPlaceShip', () => {
    test('should allow placement in empty area', () => {
      expect(board.canPlaceShip(0, 0, 3, 'horizontal')).toBe(true);
      expect(board.canPlaceShip(0, 0, 3, 'vertical')).toBe(true);
    });

    test('should reject placement outside bounds', () => {
      expect(board.canPlaceShip(0, 3, 3, 'horizontal')).toBe(false);
      expect(board.canPlaceShip(3, 0, 3, 'vertical')).toBe(false);
    });

    test('should reject placement over existing ship', () => {
      board.placeShip(0, 0, 3, 'horizontal');
      expect(board.canPlaceShip(0, 0, 3, 'vertical')).toBe(false);
      expect(board.canPlaceShip(0, 1, 2, 'horizontal')).toBe(false);
    });
  });

  describe('placeShip', () => {
    test('should place horizontal ship correctly', () => {
      board.placeShip(1, 1, 3, 'horizontal');
      
      expect(board.ships).toHaveLength(1);
      expect(board.grid[1][1]).toBe('S');
      expect(board.grid[1][2]).toBe('S');
      expect(board.grid[1][3]).toBe('S');
      expect(board.grid[1][0]).toBe('~');
      expect(board.grid[1][4]).toBe('~');
      
      const ship = board.ships[0];
      expect(ship.locations).toEqual(['11', '12', '13']);
    });

    test('should place vertical ship correctly', () => {
      board.placeShip(1, 1, 3, 'vertical');
      
      expect(board.ships).toHaveLength(1);
      expect(board.grid[1][1]).toBe('S');
      expect(board.grid[2][1]).toBe('S');
      expect(board.grid[3][1]).toBe('S');
      expect(board.grid[0][1]).toBe('~');
      expect(board.grid[4][1]).toBe('~');
      
      const ship = board.ships[0];
      expect(ship.locations).toEqual(['11', '21', '31']);
    });
  });

  describe('placeShipsRandomly', () => {
    test('should place correct number of ships', () => {
      board.placeShipsRandomly(2, 2);
      expect(board.ships).toHaveLength(2);
    });

    test('should throw error if cannot place all ships', () => {
      // Try to place too many ships for a small board
      expect(() => {
        board.placeShipsRandomly(10, 3);
      }).toThrow('Could not place all ships');
    });

    test('should place ships without overlapping', () => {
      board.placeShipsRandomly(2, 2);
      
      const allLocations = [];
      board.ships.forEach(ship => {
        ship.locations.forEach(location => {
          expect(allLocations).not.toContain(location);
          allLocations.push(location);
        });
      });
    });
  });

  describe('validateGuess', () => {
    test('should validate correct guess format', () => {
      const result = board.validateGuess('23');
      expect(result.isValid).toBe(true);
    });

    test('should reject wrong length', () => {
      expect(board.validateGuess('2').isValid).toBe(false);
      expect(board.validateGuess('234').isValid).toBe(false);
      expect(board.validateGuess('').isValid).toBe(false);
      expect(board.validateGuess(null).isValid).toBe(false);
    });

    test('should reject out of bounds coordinates', () => {
      expect(board.validateGuess('99').isValid).toBe(false);
      expect(board.validateGuess('5a').isValid).toBe(false);
      expect(board.validateGuess('ab').isValid).toBe(false);
    });

    test('should provide appropriate error messages', () => {
      const lengthError = board.validateGuess('2');
      expect(lengthError.error).toContain('exactly two digits');
      
      const boundsError = board.validateGuess('99');
      expect(boundsError.error).toContain('valid row and column numbers');
    });
  });

  describe('processGuess', () => {
    beforeEach(() => {
      board.placeShip(2, 2, 2, 'horizontal'); // Ship at 22, 23
    });

    test('should register hit on ship', () => {
      const result = board.processGuess('22');
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.alreadyGuessed).toBe(false);
      expect(board.grid[2][2]).toBe('X');
      expect(board.guesses.has('22')).toBe(true);
    });

    test('should register miss', () => {
      const result = board.processGuess('00');
      
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.alreadyGuessed).toBe(false);
      expect(board.grid[0][0]).toBe('O');
      expect(board.guesses.has('00')).toBe(true);
    });

    test('should detect sunk ship', () => {
      board.processGuess('22');
      const result = board.processGuess('23');
      
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.ship.isSunk()).toBe(true);
    });

    test('should detect already guessed location', () => {
      board.processGuess('22');
      const result = board.processGuess('22');
      
      expect(result.alreadyGuessed).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
    });
  });

  describe('getRemainingShipsCount', () => {
    beforeEach(() => {
      board.placeShip(0, 0, 2, 'horizontal'); // Ship 1
      board.placeShip(2, 0, 2, 'horizontal'); // Ship 2
    });

    test('should return correct count when no ships sunk', () => {
      expect(board.getRemainingShipsCount()).toBe(2);
    });

    test('should return correct count when one ship sunk', () => {
      board.processGuess('00');
      board.processGuess('01');
      expect(board.getRemainingShipsCount()).toBe(1);
    });

    test('should return zero when all ships sunk', () => {
      // Sink ship 1
      board.processGuess('00');
      board.processGuess('01');
      // Sink ship 2
      board.processGuess('20');
      board.processGuess('21');
      expect(board.getRemainingShipsCount()).toBe(0);
    });
  });

  describe('allShipsSunk', () => {
    beforeEach(() => {
      board.placeShip(0, 0, 2, 'horizontal');
    });

    test('should return false when ships remain', () => {
      expect(board.allShipsSunk()).toBe(false);
      board.processGuess('00');
      expect(board.allShipsSunk()).toBe(false);
    });

    test('should return true when all ships sunk', () => {
      board.processGuess('00');
      board.processGuess('01');
      expect(board.allShipsSunk()).toBe(true);
    });
  });

  describe('getDisplayGrid', () => {
    beforeEach(() => {
      board.placeShip(0, 0, 2, 'horizontal');
      board.processGuess('00'); // Hit
      board.processGuess('22'); // Miss
    });

    test('should show ships when showShips is true', () => {
      const grid = board.getDisplayGrid(true);
      expect(grid[0][0]).toBe('X'); // Hit ship
      expect(grid[0][1]).toBe('S'); // Unhit ship
      expect(grid[2][2]).toBe('O'); // Miss
    });

    test('should hide ships when showShips is false', () => {
      const grid = board.getDisplayGrid(false);
      expect(grid[0][0]).toBe('X'); // Hit ship still shows
      expect(grid[0][1]).toBe('~'); // Unhit ship hidden
      expect(grid[2][2]).toBe('O'); // Miss still shows
    });
  });

  describe('getGuesses', () => {
    test('should return copy of guesses set', () => {
      board.processGuess('00');
      board.processGuess('11');
      
      const guesses = board.getGuesses();
      expect(guesses.has('00')).toBe(true);
      expect(guesses.has('11')).toBe(true);
      expect(guesses.size).toBe(2);
      
      // Verify it's a copy
      guesses.add('22');
      expect(board.guesses.has('22')).toBe(false);
    });
  });
}); 
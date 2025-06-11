import { Player } from '../src/Player.js';

describe('Player', () => {
  let player;
  let opponent;

  beforeEach(() => {
    player = new Player('TestPlayer', 5); // Use smaller board for testing
    opponent = new Player('Opponent', 5);
  });

  describe('constructor', () => {
    test('should create a player with correct properties', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.isHuman).toBe(true);
      expect(player.board).toBeDefined();
      expect(player.opponentBoard).toBeDefined();
      expect(player.board.size).toBe(5);
      expect(player.opponentBoard.size).toBe(5);
    });

    test('should create player with default board size', () => {
      const defaultPlayer = new Player('Default');
      expect(defaultPlayer.board.size).toBe(10);
    });
  });

  describe('setupShips', () => {
    test('should setup ships on player board', () => {
      player.setupShips(2, 2);
      expect(player.board.ships).toHaveLength(2);
      expect(player.board.ships[0].length).toBe(2);
      expect(player.board.ships[1].length).toBe(2);
    });

    test('should place ships without collision', () => {
      player.setupShips(2, 2);
      
      const allLocations = [];
      player.board.ships.forEach(ship => {
        ship.locations.forEach(location => {
          expect(allLocations).not.toContain(location);
          allLocations.push(location);
        });
      });
    });
  });

  describe('makeGuess', () => {
    beforeEach(() => {
      opponent.setupShips(1, 2); // One ship with length 2
    });

    test('should reject invalid guess format', () => {
      const result = player.makeGuess('1', opponent);
      expect(result.success).toBe(false);
      expect(result.error).toContain('exactly two digits');
    });

    test('should reject out of bounds guess', () => {
      const result = player.makeGuess('99', opponent);
      expect(result.success).toBe(false);
      expect(result.error).toContain('valid row and column');
    });

    test('should reject already guessed location', () => {
      player.makeGuess('00', opponent);
      const result = player.makeGuess('00', opponent);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already guessed');
    });

    test('should process valid miss', () => {
      // Since ships are placed randomly, we need to find an empty spot
      let emptySpot = null;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          const location = `${row}${col}`;
          const hasShip = opponent.board.ships.some(ship => 
            ship.occupiesLocation(location)
          );
          if (!hasShip) {
            emptySpot = location;
            break;
          }
        }
        if (emptySpot) break;
      }

      if (emptySpot) {
        const result = player.makeGuess(emptySpot, opponent);
        expect(result.success).toBe(true);
        expect(result.hit).toBe(false);
        expect(result.sunk).toBe(false);
        
        // Check tracking board is updated
        const row = parseInt(emptySpot[0]);
        const col = parseInt(emptySpot[1]);
        expect(player.opponentBoard.grid[row][col]).toBe('O');
      }
    });

    test('should process valid hit', () => {
      // Find a ship location
      const shipLocation = opponent.board.ships[0].locations[0];
      
      const result = player.makeGuess(shipLocation, opponent);
      expect(result.success).toBe(true);
      expect(result.hit).toBe(true);
      
      // Check tracking board is updated
      const row = parseInt(shipLocation[0]);
      const col = parseInt(shipLocation[1]);
      expect(player.opponentBoard.grid[row][col]).toBe('X');
    });

    test('should detect sunk ship', () => {
      const ship = opponent.board.ships[0];
      
      // Hit all locations of the ship except the last one
      for (let i = 0; i < ship.locations.length - 1; i++) {
        player.makeGuess(ship.locations[i], opponent);
      }
      
      // Hit the last location - this should report sunk
      const lastLocation = ship.locations[ship.locations.length - 1];
      const result = player.makeGuess(lastLocation, opponent);
      expect(result.success).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.shipSunk).toBeDefined();
    });
  });

  describe('hasWon', () => {
    beforeEach(() => {
      opponent.setupShips(1, 2);
    });

    test('should return false when opponent has ships', () => {
      expect(player.hasWon(opponent)).toBe(false);
    });

    test('should return true when all opponent ships are sunk', () => {
      // Sink all opponent ships
      opponent.board.ships.forEach(ship => {
        ship.locations.forEach(location => {
          opponent.board.processGuess(location);
        });
      });
      
      expect(player.hasWon(opponent)).toBe(true);
    });
  });

  describe('getRemainingShips', () => {
    test('should return correct count', () => {
      player.setupShips(2, 2);
      expect(player.getRemainingShips()).toBe(2);
      
      // Sink one ship
      const firstShip = player.board.ships[0];
      firstShip.locations.forEach(location => {
        player.board.processGuess(location);
      });
      
      expect(player.getRemainingShips()).toBe(1);
    });
  });

  describe('getDisplayBoard', () => {
    beforeEach(() => {
      player.setupShips(1, 2);
    });

    test('should return board with ships visible by default', () => {
      const board = player.getDisplayBoard();
      
      // Should have some ship markers
      let hasShipMarker = false;
      board.forEach(row => {
        row.forEach(cell => {
          if (cell === 'S') hasShipMarker = true;
        });
      });
      expect(hasShipMarker).toBe(true);
    });

    test('should hide ships when showShips is false', () => {
      const board = player.getDisplayBoard(false);
      
      // Should not have any ship markers (only water, hits, misses)
      board.forEach(row => {
        row.forEach(cell => {
          expect(['~', 'X', 'O']).toContain(cell);
        });
      });
    });
  });

  describe('getOpponentTrackingBoard', () => {
    beforeEach(() => {
      opponent.setupShips(1, 2);
      // Make some guesses
      player.makeGuess('00', opponent);
      player.makeGuess('11', opponent);
    });

    test('should return tracking board without ships', () => {
      const board = player.getOpponentTrackingBoard();
      
      // Should not reveal opponent's ship locations
      board.forEach(row => {
        row.forEach(cell => {
          expect(['~', 'X', 'O']).toContain(cell);
        });
      });
      
      // Should show our guesses
      expect(board[0][0]).toMatch(/[XO]/);
      expect(board[1][1]).toMatch(/[XO]/);
    });
  });
}); 
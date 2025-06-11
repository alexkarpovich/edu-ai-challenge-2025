import Player from '../src/classes/Player.js';
import Board from '../src/classes/Board.js';
import { GAME_MESSAGES } from '../src/utils/constants.js';

describe('Player', () => {
  let player;
  let playerBoard;
  let opponentBoard;

  beforeEach(() => {
    playerBoard = new Board();
    opponentBoard = new Board();
    player = new Player('TestPlayer', playerBoard);
  });

  describe('constructor', () => {
    it('should create a player with name and board', () => {
      expect(player.name).toBe('TestPlayer');
      expect(player.board).toBe(playerBoard);
    });
  });

  describe('validateInput', () => {
    it('should return valid for correct input', () => {
      const result = player.validateInput('00');
      expect(result.isValid).toBe(true);
      expect(result.row).toBe(0);
      expect(result.col).toBe(0);
    });

    it('should return valid for coordinates at board edges', () => {
      const result = player.validateInput('99');
      expect(result.isValid).toBe(true);
      expect(result.row).toBe(9);
      expect(result.col).toBe(9);
    });

    it('should return invalid for null input', () => {
      const result = player.validateInput(null);
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(GAME_MESSAGES.INVALID_INPUT);
    });

    it('should return invalid for empty input', () => {
      const result = player.validateInput('');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(GAME_MESSAGES.INVALID_INPUT);
    });

    it('should return invalid for input that is too short', () => {
      const result = player.validateInput('0');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(GAME_MESSAGES.INVALID_INPUT);
    });

    it('should return invalid for input that is too long', () => {
      const result = player.validateInput('000');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe(GAME_MESSAGES.INVALID_INPUT);
    });

    it('should return invalid for non-numeric input', () => {
      const result = player.validateInput('ab');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain(GAME_MESSAGES.INVALID_COORDINATES);
    });

    it('should return invalid for coordinates out of bounds (row too high)', () => {
      const result = player.validateInput('a0');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain(GAME_MESSAGES.INVALID_COORDINATES);
    });

    it('should return invalid for coordinates out of bounds (col too high)', () => {
      const result = player.validateInput('0a');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain(GAME_MESSAGES.INVALID_COORDINATES);
    });

    it('should return invalid for negative coordinates', () => {
      // This would be handled by the parseInt returning NaN for invalid chars
      const result = player.validateInput('-1');
      expect(result.isValid).toBe(false);
    });
  });

  describe('makeGuess', () => {
    beforeEach(() => {
      // Set up opponent board with a ship at known location
      opponentBoard.placeShipsRandomly(1, 3, false);
      opponentBoard.ships[0].locations = ['00', '01', '02'];
      opponentBoard.ships[0].hits = [false, false, false];
    });

    it('should return error for invalid input', () => {
      const result = player.makeGuess('invalid', opponentBoard);
      expect(result.success).toBe(false);
      expect(result.message).toBe(GAME_MESSAGES.INVALID_INPUT);
    });

    it('should return success for valid hit', () => {
      const result = player.makeGuess('00', opponentBoard);
      expect(result.success).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(false);
      expect(result.message).toBe(GAME_MESSAGES.PLAYER_HIT);
    });

    it('should return success for valid miss', () => {
      const result = player.makeGuess('99', opponentBoard);
      expect(result.success).toBe(true);
      expect(result.hit).toBe(false);
      expect(result.sunk).toBe(false);
      expect(result.message).toBe(GAME_MESSAGES.PLAYER_MISS);
    });

    it('should detect ship sinking', () => {
      // Hit all locations of the ship
      player.makeGuess('00', opponentBoard);
      player.makeGuess('01', opponentBoard);
      const result = player.makeGuess('02', opponentBoard);
      
      expect(result.success).toBe(true);
      expect(result.hit).toBe(true);
      expect(result.sunk).toBe(true);
      expect(result.message).toContain('sunk an enemy battleship');
    });

    it('should return error for already guessed location', () => {
      player.makeGuess('00', opponentBoard);
      const result = player.makeGuess('00', opponentBoard);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe(GAME_MESSAGES.ALREADY_GUESSED);
    });
  });

  describe('getName', () => {
    it('should return player name', () => {
      expect(player.getName()).toBe('TestPlayer');
    });
  });

  describe('getBoard', () => {
    it('should return player board', () => {
      expect(player.getBoard()).toBe(playerBoard);
    });
  });

  describe('hasLost', () => {
    beforeEach(() => {
      playerBoard.placeShipsRandomly(1, 3, true);
      playerBoard.ships[0].locations = ['00', '01', '02'];
      playerBoard.ships[0].hits = [false, false, false];
    });

    it('should return false when player has ships remaining', () => {
      expect(player.hasLost()).toBe(false);
    });

    it('should return true when all player ships are sunk', () => {
      // Sink the ship
      playerBoard.processGuess('00');
      playerBoard.processGuess('01');
      playerBoard.processGuess('02');
      
      expect(player.hasLost()).toBe(true);
    });
  });

  describe('getRemainingShips', () => {
    beforeEach(() => {
      playerBoard.placeShipsRandomly(2, 3, true);
      playerBoard.ships[0].locations = ['00', '01', '02'];
      playerBoard.ships[1].locations = ['30', '31', '32'];
      playerBoard.ships[0].hits = [false, false, false];
      playerBoard.ships[1].hits = [false, false, false];
    });

    it('should return correct count when no ships are sunk', () => {
      expect(player.getRemainingShips()).toBe(2);
    });

    it('should return correct count when some ships are sunk', () => {
      // Sink one ship
      playerBoard.processGuess('00');
      playerBoard.processGuess('01');
      playerBoard.processGuess('02');
      
      expect(player.getRemainingShips()).toBe(1);
    });

    it('should return 0 when all ships are sunk', () => {
      // Sink all ships
      playerBoard.processGuess('00');
      playerBoard.processGuess('01');
      playerBoard.processGuess('02');
      playerBoard.processGuess('30');
      playerBoard.processGuess('31');
      playerBoard.processGuess('32');
      
      expect(player.getRemainingShips()).toBe(0);
    });
  });
}); 
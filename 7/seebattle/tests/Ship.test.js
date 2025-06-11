import Ship from '../src/classes/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(['00', '01', '02']);
  });

  describe('constructor', () => {
    it('should create a ship with given locations', () => {
      expect(ship.locations).toEqual(['00', '01', '02']);
      expect(ship.hits).toEqual([false, false, false]);
    });

    it('should create an empty ship when no locations provided', () => {
      const emptyShip = new Ship();
      expect(emptyShip.locations).toEqual([]);
      expect(emptyShip.hits).toEqual([]);
    });
  });

  describe('isHitAt', () => {
    it('should return true if location is part of the ship', () => {
      expect(ship.isHitAt('00')).toBe(true);
      expect(ship.isHitAt('01')).toBe(true);
      expect(ship.isHitAt('02')).toBe(true);
    });

    it('should return false if location is not part of the ship', () => {
      expect(ship.isHitAt('03')).toBe(false);
      expect(ship.isHitAt('10')).toBe(false);
    });
  });

  describe('hit', () => {
    it('should successfully hit a valid location', () => {
      const result = ship.hit('00');
      expect(result).toBe(true);
      expect(ship.hits[0]).toBe(true);
    });

    it('should return false when hitting an already hit location', () => {
      ship.hit('00');
      const result = ship.hit('00');
      expect(result).toBe(false);
    });

    it('should return false when hitting an invalid location', () => {
      const result = ship.hit('99');
      expect(result).toBe(false);
    });
  });

  describe('isSunk', () => {
    it('should return false when ship is not fully hit', () => {
      ship.hit('00');
      expect(ship.isSunk()).toBe(false);
    });

    it('should return true when all locations are hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });

    it('should return true for empty ship', () => {
      const emptyShip = new Ship([]);
      expect(emptyShip.isSunk()).toBe(true);
    });
  });

  describe('isAlreadyHit', () => {
    it('should return true if location was already hit', () => {
      ship.hit('00');
      expect(ship.isAlreadyHit('00')).toBe(true);
    });

    it('should return false if location was not hit', () => {
      expect(ship.isAlreadyHit('00')).toBe(false);
    });

    it('should return false for invalid location', () => {
      expect(ship.isAlreadyHit('99')).toBe(false);
    });
  });

  describe('getHitCount', () => {
    it('should return 0 for new ship', () => {
      expect(ship.getHitCount()).toBe(0);
    });

    it('should return correct hit count', () => {
      ship.hit('00');
      ship.hit('01');
      expect(ship.getHitCount()).toBe(2);
    });
  });

  describe('getLocations', () => {
    it('should return a copy of locations array', () => {
      const locations = ship.getLocations();
      expect(locations).toEqual(['00', '01', '02']);
      
      // Ensure it's a copy, not the original array
      locations.push('03');
      expect(ship.locations).toEqual(['00', '01', '02']);
    });
  });
}); 
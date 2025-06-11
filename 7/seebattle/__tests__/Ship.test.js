import { Ship } from '../src/Ship.js';

describe('Ship', () => {
  let ship;

  beforeEach(() => {
    ship = new Ship(3);
  });

  describe('constructor', () => {
    test('should create a ship with correct length', () => {
      expect(ship.length).toBe(3);
      expect(ship.locations).toEqual([]);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should create a ship with different length', () => {
      const bigShip = new Ship(5);
      expect(bigShip.length).toBe(5);
      expect(bigShip.hits).toEqual([false, false, false, false, false]);
    });
  });

  describe('setLocations', () => {
    test('should set locations correctly', () => {
      const locations = ['00', '01', '02'];
      ship.setLocations(locations);
      expect(ship.locations).toEqual(['00', '01', '02']);
    });

    test('should throw error for wrong number of locations', () => {
      expect(() => {
        ship.setLocations(['00', '01']);
      }).toThrow('Ship requires exactly 3 locations');
    });

    test('should create a copy of locations array', () => {
      const locations = ['00', '01', '02'];
      ship.setLocations(locations);
      locations.push('03');
      expect(ship.locations).toEqual(['00', '01', '02']);
    });
  });

  describe('hit', () => {
    beforeEach(() => {
      ship.setLocations(['00', '01', '02']);
    });

    test('should register hit at valid location', () => {
      const result = ship.hit('01');
      expect(result).toBe(true);
      expect(ship.hits[1]).toBe(true);
      expect(ship.hits[0]).toBe(false);
      expect(ship.hits[2]).toBe(false);
    });

    test('should return false for invalid location', () => {
      const result = ship.hit('99');
      expect(result).toBe(false);
      expect(ship.hits).toEqual([false, false, false]);
    });

    test('should handle multiple hits', () => {
      ship.hit('00');
      ship.hit('02');
      expect(ship.hits).toEqual([true, false, true]);
    });
  });

  describe('isSunk', () => {
    beforeEach(() => {
      ship.setLocations(['00', '01', '02']);
    });

    test('should return false when no hits', () => {
      expect(ship.isSunk()).toBe(false);
    });

    test('should return false when partially hit', () => {
      ship.hit('00');
      ship.hit('01');
      expect(ship.isSunk()).toBe(false);
    });

    test('should return true when all parts hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.isSunk()).toBe(true);
    });
  });

  describe('isHitAt', () => {
    beforeEach(() => {
      ship.setLocations(['00', '01', '02']);
      ship.hit('01');
    });

    test('should return true for hit location', () => {
      expect(ship.isHitAt('01')).toBe(true);
    });

    test('should return false for unhit location', () => {
      expect(ship.isHitAt('00')).toBe(false);
      expect(ship.isHitAt('02')).toBe(false);
    });

    test('should return false for invalid location', () => {
      expect(ship.isHitAt('99')).toBe(false);
    });
  });

  describe('getHitLocations', () => {
    beforeEach(() => {
      ship.setLocations(['00', '01', '02']);
    });

    test('should return empty array when no hits', () => {
      expect(ship.getHitLocations()).toEqual([]);
    });

    test('should return hit locations', () => {
      ship.hit('00');
      ship.hit('02');
      expect(ship.getHitLocations()).toEqual(['00', '02']);
    });

    test('should return all locations when fully hit', () => {
      ship.hit('00');
      ship.hit('01');
      ship.hit('02');
      expect(ship.getHitLocations()).toEqual(['00', '01', '02']);
    });
  });

  describe('occupiesLocation', () => {
    beforeEach(() => {
      ship.setLocations(['00', '01', '02']);
    });

    test('should return true for occupied location', () => {
      expect(ship.occupiesLocation('01')).toBe(true);
    });

    test('should return false for unoccupied location', () => {
      expect(ship.occupiesLocation('99')).toBe(false);
    });

    test('should work for all ship locations', () => {
      expect(ship.occupiesLocation('00')).toBe(true);
      expect(ship.occupiesLocation('01')).toBe(true);
      expect(ship.occupiesLocation('02')).toBe(true);
    });
  });
}); 
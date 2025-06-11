/**
 * Represents a ship in the battleship game
 */
export class Ship {
  constructor(length) {
    this.length = length;
    this.locations = [];
    this.hits = new Array(length).fill(false);
  }

  /**
   * Sets the locations for this ship
   * @param {string[]} locations - Array of location strings (e.g., ['00', '01', '02'])
   */
  setLocations(locations) {
    if (locations.length !== this.length) {
      throw new Error(`Ship requires exactly ${this.length} locations`);
    }
    this.locations = [...locations];
  }

  /**
   * Records a hit at the specified location
   * @param {string} location - Location string (e.g., '23')
   * @returns {boolean} - True if hit was successful, false if location not found
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0) {
      this.hits[index] = true;
      return true;
    }
    return false;
  }

  /**
   * Checks if the ship is completely sunk
   * @returns {boolean} - True if all parts of the ship have been hit
   */
  isSunk() {
    return this.hits.every(hit => hit === true);
  }

  /**
   * Checks if a specific location has been hit
   * @param {string} location - Location to check
   * @returns {boolean} - True if location has been hit
   */
  isHitAt(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index];
  }

  /**
   * Gets all locations that have been hit
   * @returns {string[]} - Array of hit locations
   */
  getHitLocations() {
    return this.locations.filter((location, index) => this.hits[index]);
  }

  /**
   * Checks if this ship occupies the given location
   * @param {string} location - Location to check
   * @returns {boolean} - True if ship occupies this location
   */
  occupiesLocation(location) {
    return this.locations.includes(location);
  }
} 
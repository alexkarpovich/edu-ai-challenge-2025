import { GAME_CONFIG } from '../utils/constants.js';

export class Ship {
  constructor(locations = []) {
    this.locations = [...locations];
    this.hits = new Array(locations.length).fill(false);
  }

  /**
   * Check if the ship is hit at a specific location
   * @param {string} location - Location in format "rowcol" (e.g., "00", "34")
   * @returns {boolean} - True if location is part of this ship
   */
  isHitAt(location) {
    const index = this.locations.indexOf(location);
    return index >= 0;
  }

  /**
   * Mark a hit at a specific location
   * @param {string} location - Location in format "rowcol"
   * @returns {boolean} - True if hit was successful, false if already hit or invalid
   */
  hit(location) {
    const index = this.locations.indexOf(location);
    if (index >= 0 && !this.hits[index]) {
      this.hits[index] = true;
      return true;
    }
    return false;
  }

  /**
   * Check if the ship is completely sunk
   * @returns {boolean} - True if all locations are hit
   */
  isSunk() {
    return this.hits.every(hit => hit);
  }

  /**
   * Check if a location was already hit on this ship
   * @param {string} location - Location in format "rowcol"
   * @returns {boolean} - True if location was already hit
   */
  isAlreadyHit(location) {
    const index = this.locations.indexOf(location);
    return index >= 0 && this.hits[index];
  }

  /**
   * Get the number of hits on this ship
   * @returns {number} - Number of hits
   */
  getHitCount() {
    return this.hits.filter(hit => hit).length;
  }

  /**
   * Get all locations of this ship
   * @returns {string[]} - Array of location strings
   */
  getLocations() {
    return [...this.locations];
  }
}

export default Ship; 
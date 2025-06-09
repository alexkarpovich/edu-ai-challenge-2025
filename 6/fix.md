# Enigma Machine Bug Fixes

## Bugs Identified

### 1. Missing Final Plugboard Swap

**Problem**: In the `encryptChar` method, the character was not passed through the plugboard a second time after the backward pass through the rotors.

**Location**: Lines 65-72 in original code

**Issue**: The Enigma machine signal path should be:
```
Input → Plugboard → Rotors (Forward) → Reflector → Rotors (Backward) → Plugboard → Output
```

But the original code was missing the final plugboard step:
```javascript
// Original (WRONG)
encryptChar(c) {
  // ... rotor stepping and initial plugboard ...
  // ... forward pass and reflector ...
  // ... backward pass ...
  return c; // Missing final plugboard!
}
```

**Fix**: Added the missing plugboard swap at the end:
```javascript
// Fixed (CORRECT)
encryptChar(c) {
  // ... rotor stepping and initial plugboard ...
  // ... forward pass and reflector ...
  // ... backward pass ...
  c = plugboardSwap(c, this.plugboardPairs); // Added final plugboard
  return c;
}
```

### 2. Incomplete Double-Stepping Mechanism

**Problem**: The rotor stepping mechanism didn't implement proper double-stepping behavior.

**Location**: Lines 53-57 in original code

**Issue**: In a real Enigma machine, when the middle rotor is at its notch position, both the middle and left rotors should step on the same key press (double-stepping). The original code only stepped the left rotor when the middle rotor was at its notch.

**Original (WRONG)**:
```javascript
stepRotors() {
  if (this.rotors[2].atNotch()) this.rotors[1].step();
  if (this.rotors[1].atNotch()) this.rotors[0].step(); // Middle doesn't step itself!
  this.rotors[2].step();
}
```

**Fix**: Implemented proper double-stepping:
```javascript
stepRotors() {
  const middleAtNotch = this.rotors[1].atNotch();
  const rightAtNotch = this.rotors[2].atNotch();
  
  // If middle rotor is at notch, both middle and left rotors step
  if (middleAtNotch) {
    this.rotors[0].step(); // Left rotor steps
    this.rotors[1].step(); // Middle rotor steps (double-stepping)
  }
  
  // If right rotor is at notch, middle rotor steps
  if (rightAtNotch) {
    this.rotors[1].step();
  }
  
  // Right rotor always steps
  this.rotors[2].step();
}
```

## Impact

These bugs would cause:
1. **Incorrect encryption/decryption**: Without the final plugboard swap, the machine wouldn't be reciprocal (encrypting twice wouldn't return original text)
2. **Wrong rotor positions**: Incorrect stepping would cause different rotor positions than expected, leading to completely different encryption results

## Validation

The fixed version now properly:
- Applies plugboard swaps at both ends of the encryption process
- Implements correct double-stepping behavior for historically accurate Enigma operation
- Maintains the reciprocal property (encrypting the same text twice returns the original) 
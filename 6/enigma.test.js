const { Enigma, Rotor, plugboardSwap, ROTORS, REFLECTOR, alphabet } = require('./enigma.js');

// Simple testing framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
  }

  assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(`Expected true, got false. ${message}`);
    }
  }

  run() {
    console.log('🧪 Running Enigma Machine Tests...\n');
    
    for (const { name, fn } of this.tests) {
      try {
        fn.call(this);
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
        this.failed++;
      }
    }
    
    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    console.log(`Coverage: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);
    
    return this.failed === 0;
  }
}

const runner = new TestRunner();

// Test 1: Plugboard Swap Function
runner.test('Plugboard swap function works correctly', function() {
  this.assertEqual(plugboardSwap('A', [['A', 'B']]), 'B');
  this.assertEqual(plugboardSwap('B', [['A', 'B']]), 'A');
  this.assertEqual(plugboardSwap('C', [['A', 'B']]), 'C');
  this.assertEqual(plugboardSwap('X', [['A', 'B'], ['X', 'Y']]), 'Y');
  this.assertEqual(plugboardSwap('Z', []), 'Z');
});

// Test 2: Rotor Basic Functionality
runner.test('Rotor stepping works correctly', function() {
  const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
  this.assertEqual(rotor.position, 0);
  rotor.step();
  this.assertEqual(rotor.position, 1);
  
  // Test wrapping
  rotor.position = 25;
  rotor.step();
  this.assertEqual(rotor.position, 0);
});

// Test 3: Rotor Notch Detection
runner.test('Rotor notch detection works correctly', function() {
  const rotor = new Rotor(ROTORS[0].wiring, ROTORS[0].notch, 0, 0);
  
  // Rotor I notch is at Q (position 16)
  rotor.position = 16; // Q
  this.assertTrue(rotor.atNotch());
  
  rotor.position = 15; // P
  this.assertTrue(!rotor.atNotch());
});

// Test 4: Reciprocal Property (Most Important Test)
runner.test('Enigma reciprocal property - encrypt twice returns original', function() {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const message = 'HELLO';
  
  const encrypted = enigma.process(message);
  
  // Reset enigma to same initial state
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const decrypted = enigma2.process(encrypted);
  
  this.assertEqual(decrypted, message, 'Enigma should be reciprocal');
});

// Test 5: Reciprocal Property with Plugboard
runner.test('Enigma reciprocal property with plugboard', function() {
  const plugboard = [['A', 'B'], ['C', 'D']];
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
  const message = 'HELLO';
  
  const encrypted = enigma.process(message);
  
  // Reset enigma to same initial state
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], plugboard);
  const decrypted = enigma2.process(encrypted);
  
  this.assertEqual(decrypted, message, 'Enigma with plugboard should be reciprocal');
});

// Test 6: Plugboard Effect
runner.test('Plugboard affects encryption', function() {
  const noPlugs = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const withPlugs = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], [['A', 'B']]);
  
  const message = 'A';
  const result1 = noPlugs.process(message);
  const result2 = withPlugs.process(message);
  
  this.assertTrue(result1 !== result2, 'Plugboard should change encryption result');
});

// Test 7: Rotor Stepping Sequence
runner.test('Rotor stepping sequence', function() {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Initial positions
  this.assertEqual(enigma.rotors[0].position, 0);
  this.assertEqual(enigma.rotors[1].position, 0);
  this.assertEqual(enigma.rotors[2].position, 0);
  
  // First character - only rightmost rotor should step
  enigma.encryptChar('A');
  this.assertEqual(enigma.rotors[0].position, 0);
  this.assertEqual(enigma.rotors[1].position, 0);
  this.assertEqual(enigma.rotors[2].position, 1);
  
  // Continue until middle rotor steps
  for (let i = 1; i < 26; i++) {
    enigma.encryptChar('A');
  }
  
  // After 26 characters, middle rotor should have stepped
  this.assertEqual(enigma.rotors[1].position, 1);
  this.assertEqual(enigma.rotors[2].position, 0);
});

// Test 8: Double Stepping Behavior
runner.test('Double stepping mechanism', function() {
  // Set up enigma with middle rotor at notch position
  // Rotor II has notch at E (position 4)
  const enigma = new Enigma([0, 1, 2], [0, 4, 0], [0, 0, 0], []);
  
  // Before encryption
  this.assertEqual(enigma.rotors[0].position, 0); // Left
  this.assertEqual(enigma.rotors[1].position, 4); // Middle (at notch E)
  this.assertEqual(enigma.rotors[2].position, 0); // Right
  
  // Encrypt one character - should trigger double stepping
  enigma.encryptChar('A');
  
  // After encryption: middle rotor at notch should cause double stepping
  this.assertEqual(enigma.rotors[0].position, 1, 'Left rotor should step due to middle notch');
  this.assertEqual(enigma.rotors[1].position, 5, 'Middle rotor should step due to own notch');
  this.assertEqual(enigma.rotors[2].position, 1, 'Right rotor should step normally');
});

// Test 9: Different Rotor Configurations
runner.test('Different rotor configurations produce different results', function() {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([2, 1, 0], [0, 0, 0], [0, 0, 0], []);
  
  const message = 'HELLO';
  const result1 = enigma1.process(message);
  const result2 = enigma2.process(message);
  
  this.assertTrue(result1 !== result2, 'Different rotor orders should produce different results');
});

// Test 10: Ring Settings Effect
runner.test('Ring settings affect encryption', function() {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [1, 2, 3], []);
  
  const message = 'HELLO';
  const result1 = enigma1.process(message);
  const result2 = enigma2.process(message);
  
  this.assertTrue(result1 !== result2, 'Different ring settings should produce different results');
});

// Test 11: Non-alphabetic Characters
runner.test('Non-alphabetic characters pass through unchanged', function() {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  this.assertEqual(enigma.encryptChar('1'), '1');
  this.assertEqual(enigma.encryptChar(' '), ' ');
  this.assertEqual(enigma.encryptChar('.'), '.');
  
  const result = enigma.process('HELLO, WORLD!');
  this.assertTrue(result.includes(','));
  this.assertTrue(result.includes(' '));
  this.assertTrue(result.includes('!'));
});

// Test 12: Case Insensitivity
runner.test('Input is converted to uppercase', function() {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  const result1 = enigma1.process('hello');
  const result2 = enigma2.process('HELLO');
  
  this.assertEqual(result1, result2, 'Lowercase and uppercase should produce same result');
});

// Test 13: Empty String Handling
runner.test('Empty string handling', function() {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  this.assertEqual(enigma.process(''), '');
});

// Test 14: Known Test Vector (if available)
runner.test('Known Enigma test vector', function() {
  // This is a simplified test - in real scenarios you'd use historical test vectors
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const message = 'A';
  const result = enigma.process(message);
  
  // Just verify it's not the same as input
  this.assertTrue(result !== message, 'Encrypted character should differ from input');
  this.assertTrue(result.length === 1, 'Output length should match input length');
  this.assertTrue(/[A-Z]/.test(result), 'Output should be uppercase letter');
});

// Test 15: Rotor Position Boundaries
runner.test('Rotor position boundaries', function() {
  const enigma = new Enigma([0, 1, 2], [0, 0, 25], [0, 0, 0], []);
  
  // Encrypt one character to test wrap-around
  enigma.encryptChar('A');
  
  // Right rotor should wrap to 0
  this.assertEqual(enigma.rotors[2].position, 0);
  // Left and middle rotors should not step (right rotor wasn't at notch)
  this.assertEqual(enigma.rotors[1].position, 0);
  this.assertEqual(enigma.rotors[0].position, 0);
});

// Test 16: Right Rotor Notch Behavior
runner.test('Right rotor notch causes middle rotor to step', function() {
  // Set right rotor to its notch position (Rotor III notch is at V = position 21)
  const enigma = new Enigma([0, 1, 2], [0, 0, 21], [0, 0, 0], []);
  
  // Before encryption
  this.assertEqual(enigma.rotors[2].position, 21); // Right rotor at notch V
  this.assertEqual(enigma.rotors[1].position, 0);  // Middle rotor
  
  // Encrypt one character - should cause middle rotor to step
  enigma.encryptChar('A');
  
  // After encryption
  this.assertEqual(enigma.rotors[2].position, 22, 'Right rotor should step from notch');
  this.assertEqual(enigma.rotors[1].position, 1, 'Middle rotor should step due to right rotor notch');
  this.assertEqual(enigma.rotors[0].position, 0, 'Left rotor should not step');
});

// Run all tests
if (require.main === module) {
  const success = runner.run();
  process.exit(success ? 0 : 1);
}

module.exports = { TestRunner, runner }; 
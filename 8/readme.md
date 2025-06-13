# JavaScript Validation Library

A robust, type-safe validation library for JavaScript that supports both primitive and complex data types with an intuitive, chainable API.

## Features

✅ **Primitive Type Validation**: String, Number, Boolean, Date  
✅ **Complex Type Validation**: Arrays, Objects  
✅ **Method Chaining**: Fluent API for combining validation rules  
✅ **Custom Error Messages**: Personalized validation feedback  
✅ **Optional Fields**: Flexible validation for optional properties  
✅ **Nested Validation**: Deep validation of complex data structures  
✅ **Pattern Matching**: Regular expression support for strings  
✅ **Email Validation**: Built-in email format validation  
✅ **Comprehensive Testing**: 60+ test cases with high coverage  

## Installation

Since this is a standalone library, simply include the `schema.js` file in your project:

```javascript
const { Schema } = require('./schema.js');
```

## Quick Start

```javascript
const { Schema } = require('./schema.js');

// Simple validation
const nameValidator = Schema.string().minLength(2).maxLength(50);
const result = nameValidator.validate("John Doe");

if (result.success) {
  console.log("Valid name!");
} else {
  console.log("Error:", result.error);
}
```

## API Reference

### Basic Validators

#### String Validator

```javascript
const validator = Schema.string()
  .minLength(5)           // Minimum length
  .maxLength(100)         // Maximum length
  .pattern(/^[A-Za-z]+$/) // Regex pattern
  .email()                // Email format
  .notEmpty()             // Non-empty after trimming
  .optional()             // Make field optional
  .withMessage('Custom error message');
```

#### Number Validator

```javascript
const validator = Schema.number()
  .min(0)                 // Minimum value
  .max(100)               // Maximum value
  .integer()              // Must be integer
  .positive()             // Must be positive
  .optional()             // Make field optional
  .withMessage('Custom error message');
```

#### Boolean Validator

```javascript
const validator = Schema.boolean()
  .optional()             // Make field optional
  .withMessage('Custom error message');
```

#### Date Validator

```javascript
const validator = Schema.date()
  .after(new Date('2020-01-01'))  // Must be after date
  .before(new Date('2030-12-31')) // Must be before date
  .optional()                     // Make field optional
  .withMessage('Custom error message');
```

### Complex Validators

#### Array Validator

```javascript
const validator = Schema.array(Schema.string())
  .minLength(1)           // Minimum array length
  .maxLength(10)          // Maximum array length
  .optional()             // Make field optional
  .withMessage('Custom error message');
```

#### Object Validator

```javascript
const validator = Schema.object({
  name: Schema.string().notEmpty(),
  age: Schema.number().min(0).integer(),
  email: Schema.string().email().optional()
})
.optional()               // Make field optional
.withMessage('Custom error message');
```

## Usage Examples

### Basic Validation

```javascript
const { Schema } = require('./schema.js');

// String validation
const nameResult = Schema.string()
  .minLength(2)
  .maxLength(50)
  .validate("John Doe");

console.log(nameResult); // { success: true, value: "John Doe" }

// Number validation
const ageResult = Schema.number()
  .min(0)
  .max(120)
  .integer()
  .validate(25);

console.log(ageResult); // { success: true, value: 25 }

// Email validation
const emailResult = Schema.string()
  .email()
  .validate("user@example.com");

console.log(emailResult); // { success: true, value: "user@example.com" }
```

### Complex Schema Validation

```javascript
const { Schema } = require('./schema.js');

// Define a user schema
const userSchema = Schema.object({
  id: Schema.string().notEmpty(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  age: Schema.number().min(0).max(150).integer().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()).minLength(1),
  address: Schema.object({
    street: Schema.string().notEmpty(),
    city: Schema.string().notEmpty(),
    postalCode: Schema.string().pattern(/^\d{5}$/),
    country: Schema.string().notEmpty()
  }).optional()
});

// Validate user data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

const result = userSchema.validate(userData);

if (result.success) {
  console.log("User data is valid!");
} else {
  console.log("Validation error:", result.error);
}
```

### Custom Error Messages

```javascript
const validator = Schema.string()
  .minLength(8)
  .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
  .withMessage("Password must be at least 8 characters with letters and numbers");

const result = validator.validate("123");
console.log(result.error); // "Password must be at least 8 characters with letters and numbers"
```

### Optional Fields

```javascript
const schema = Schema.object({
  name: Schema.string().notEmpty(),
  email: Schema.string().email().optional(), // Optional field
  phone: Schema.string().optional()           // Optional field
});

// This will pass even without email and phone
const result = schema.validate({ name: "John Doe" });
console.log(result.success); // true
```

## Error Handling

The validation library returns a result object with the following structure:

```javascript
// Success case
{
  success: true,
  value: validatedValue
}

// Error case
{
  success: false,
  error: "Error message describing what went wrong"
}
```

### Error Message Examples

```javascript
// Type errors
"Value must be a string"
"Value must be a valid number"
"Value must be a boolean"
"Value must be an array"
"Value must be an object"

// Constraint errors
"String must be at least 5 characters long"
"Number must be at least 10"
"Array must have at least 1 items"
"String does not match required pattern"

// Complex validation errors
"Property 'email': Invalid email format"
"Item at index 2: Value must be a string"
```

## Running Tests

### Run All Tests

```bash
node schema.test.js
```

### Test Output

The test suite will output:
- ✅ Passed tests (green checkmarks)
- ❌ Failed tests (red X marks with error details)
- Summary with pass/fail counts and coverage percentage
- Detailed test coverage report saved to `test_report.txt`

### Test Coverage

The test suite includes:
- **60+ test cases** covering all functionality
- **Base validator tests** (optional fields, custom messages)
- **String validation tests** (length, patterns, email)
- **Number validation tests** (min/max, integer, positive)
- **Boolean validation tests**
- **Date validation tests** (before/after constraints)
- **Array validation tests** (length, item validation)
- **Object validation tests** (property validation)
- **Complex schema tests** (nested objects, real-world scenarios)
- **Method chaining tests**
- **Edge case tests**

Expected coverage: **95%+**

## Advanced Usage

### Nested Object Validation

```javascript
const companySchema = Schema.object({
  name: Schema.string().notEmpty(),
  employees: Schema.array(
    Schema.object({
      id: Schema.string().notEmpty(),
      name: Schema.string().minLength(2),
      role: Schema.string().notEmpty(),
      salary: Schema.number().min(0).integer()
    })
  ).minLength(1),
  address: Schema.object({
    street: Schema.string().notEmpty(),
    city: Schema.string().notEmpty(),
    country: Schema.string().notEmpty()
  })
});
```

### Custom Validation Rules

You can extend the base validators or create custom validation logic:

```javascript
// Custom validator for specific business rules
const customValidator = Schema.string()
  .minLength(3)
  .pattern(/^[A-Z]/) // Must start with uppercase
  .withMessage("Code must be at least 3 characters and start with uppercase letter");
```

## Best Practices

1. **Use Method Chaining**: Combine multiple validation rules for comprehensive validation
2. **Custom Error Messages**: Provide clear, user-friendly error messages
3. **Optional Fields**: Use `.optional()` for fields that may not be present
4. **Nested Validation**: Define reusable schemas for complex nested structures
5. **Type Safety**: Validate all input data at application boundaries

## Troubleshooting

### Common Issues

1. **"Cannot read property 'validate' of undefined"**
   - Make sure you're importing the Schema class correctly
   - Check that the schema.js file is in the correct location

2. **"Value must be a string" for valid strings**
   - Ensure you're passing the actual value, not a wrapper object
   - Check for null or undefined values

3. **Array validation fails for valid arrays**
   - Make sure you're providing an item validator: `Schema.array(Schema.string())`
   - Check that all array items match the expected type

### Getting Help

If you encounter issues:
1. Check the error message for specific validation failures
2. Review the test cases in `schema.test.js` for usage examples
3. Ensure your data matches the expected schema structure

## License

This validation library is provided as-is for educational and development purposes.
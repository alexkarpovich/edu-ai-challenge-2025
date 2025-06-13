/**
 * Robust Validation Library for JavaScript
 * Provides type-safe validation for primitive and complex data types
 */

/**
 * Base Validator class that all other validators extend
 * Contains common validation logic and error handling
 */
class Validator {
  constructor() {
    this.rules = [];
    this.isOptional = false;
    this.customMessage = null;
  }

  /**
   * Marks the field as optional during validation
   * @returns {Validator} - Returns this for method chaining
   */
  optional() {
    this.isOptional = true;
    return this;
  }

  /**
   * Sets a custom error message for validation failures
   * @param {string} message - Custom error message
   * @returns {Validator} - Returns this for method chaining
   */
  withMessage(message) {
    this.customMessage = message;
    return this;
  }

  /**
   * Validates a value against all defined rules
   * @param {any} value - Value to validate
   * @returns {Object} - Validation result with success/error information
   */
  validate(value) {
    // Handle optional fields
    if (value === undefined || value === null) {
      if (this.isOptional) {
        return { success: true, value: value };
      }
      return {
        success: false,
        error: this.customMessage || 'Field is required'
      };
    }

    // Apply all validation rules
    for (const rule of this.rules) {
      const result = rule(value);
      if (!result.success) {
        return {
          success: false,
          error: this.customMessage || result.error
        };
      }
    }

    return { success: true, value: value };
  }
}

/**
 * String validator with various string-specific validation rules
 */
class StringValidator extends Validator {
  constructor() {
    super();
    // Add basic string type check
    this.rules.push((value) => {
      if (typeof value !== 'string') {
        return { success: false, error: 'Value must be a string' };
      }
      return { success: true };
    });
  }

  /**
   * Sets minimum length requirement for the string
   * @param {number} min - Minimum length
   * @returns {StringValidator} - Returns this for method chaining
   */
  minLength(min) {
    this.rules.push((value) => {
      if (value.length < min) {
        return { success: false, error: `String must be at least ${min} characters long` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Sets maximum length requirement for the string
   * @param {number} max - Maximum length
   * @returns {StringValidator} - Returns this for method chaining
   */
  maxLength(max) {
    this.rules.push((value) => {
      if (value.length > max) {
        return { success: false, error: `String must not exceed ${max} characters` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Validates string against a regular expression pattern
   * @param {RegExp} regex - Regular expression pattern
   * @returns {StringValidator} - Returns this for method chaining
   */
  pattern(regex) {
    this.rules.push((value) => {
      if (!regex.test(value)) {
        return { success: false, error: 'String does not match required pattern' };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Validates that string is a valid email format
   * @returns {StringValidator} - Returns this for method chaining
   */
  email() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.pattern(emailRegex).withMessage('Invalid email format');
  }

  /**
   * Validates that string is not empty (after trimming)
   * @returns {StringValidator} - Returns this for method chaining
   */
  notEmpty() {
    this.rules.push((value) => {
      if (value.trim().length === 0) {
        return { success: false, error: 'String cannot be empty' };
      }
      return { success: true };
    });
    return this;
  }
}

/**
 * Number validator with various numeric validation rules
 */
class NumberValidator extends Validator {
  constructor() {
    super();
    // Add basic number type check
    this.rules.push((value) => {
      if (typeof value !== 'number' || isNaN(value)) {
        return { success: false, error: 'Value must be a valid number' };
      }
      return { success: true };
    });
  }

  /**
   * Sets minimum value requirement
   * @param {number} min - Minimum value
   * @returns {NumberValidator} - Returns this for method chaining
   */
  min(min) {
    this.rules.push((value) => {
      if (value < min) {
        return { success: false, error: `Number must be at least ${min}` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Sets maximum value requirement
   * @param {number} max - Maximum value
   * @returns {NumberValidator} - Returns this for method chaining
   */
  max(max) {
    this.rules.push((value) => {
      if (value > max) {
        return { success: false, error: `Number must not exceed ${max}` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Validates that number is an integer
   * @returns {NumberValidator} - Returns this for method chaining
   */
  integer() {
    this.rules.push((value) => {
      if (!Number.isInteger(value)) {
        return { success: false, error: 'Number must be an integer' };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Validates that number is positive
   * @returns {NumberValidator} - Returns this for method chaining
   */
  positive() {
    this.rules.push((value) => {
      if (value <= 0) {
        return { success: false, error: 'Number must be positive' };
      }
      return { success: true };
    });
    return this;
  }
}

/**
 * Boolean validator for boolean values
 */
class BooleanValidator extends Validator {
  constructor() {
    super();
    // Add basic boolean type check
    this.rules.push((value) => {
      if (typeof value !== 'boolean') {
        return { success: false, error: 'Value must be a boolean' };
      }
      return { success: true };
    });
  }
}

/**
 * Date validator for Date objects and date strings
 */
class DateValidator extends Validator {
  constructor() {
    super();
    // Add basic date validation
    this.rules.push((value) => {
      const date = value instanceof Date ? value : new Date(value);
      if (isNaN(date.getTime())) {
        return { success: false, error: 'Value must be a valid date' };
      }
      return { success: true };
    });
  }

  /**
   * Validates that date is after a specified date
   * @param {Date|string} minDate - Minimum date
   * @returns {DateValidator} - Returns this for method chaining
   */
  after(minDate) {
    this.rules.push((value) => {
      const date = value instanceof Date ? value : new Date(value);
      const min = minDate instanceof Date ? minDate : new Date(minDate);
      if (date <= min) {
        return { success: false, error: `Date must be after ${min.toISOString()}` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Validates that date is before a specified date
   * @param {Date|string} maxDate - Maximum date
   * @returns {DateValidator} - Returns this for method chaining
   */
  before(maxDate) {
    this.rules.push((value) => {
      const date = value instanceof Date ? value : new Date(value);
      const max = maxDate instanceof Date ? maxDate : new Date(maxDate);
      if (date >= max) {
        return { success: false, error: `Date must be before ${max.toISOString()}` };
      }
      return { success: true };
    });
    return this;
  }
}

/**
 * Array validator for validating arrays and their elements
 */
class ArrayValidator extends Validator {
  constructor(itemValidator) {
    super();
    this.itemValidator = itemValidator;
    
    // Add basic array type check
    this.rules.push((value) => {
      if (!Array.isArray(value)) {
        return { success: false, error: 'Value must be an array' };
      }
      return { success: true };
    });
  }

  /**
   * Sets minimum length requirement for the array
   * @param {number} min - Minimum length
   * @returns {ArrayValidator} - Returns this for method chaining
   */
  minLength(min) {
    this.rules.push((value) => {
      if (value.length < min) {
        return { success: false, error: `Array must have at least ${min} items` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Sets maximum length requirement for the array
   * @param {number} max - Maximum length
   * @returns {ArrayValidator} - Returns this for method chaining
   */
  maxLength(max) {
    this.rules.push((value) => {
      if (value.length > max) {
        return { success: false, error: `Array must not exceed ${max} items` };
      }
      return { success: true };
    });
    return this;
  }

  /**
   * Validates a value against array rules and validates each item
   * @param {any} value - Value to validate
   * @returns {Object} - Validation result
   */
  validate(value) {
    // Handle optional fields first
    if (value === undefined || value === null) {
      if (this.isOptional) {
        return { success: true, value: value };
      }
      // For arrays, null should be treated as a type error, not a required field error
      if (value === null) {
        return {
          success: false,
          error: this.customMessage || 'Value must be an array'
        };
      }
      return {
        success: false,
        error: this.customMessage || 'Field is required'
      };
    }

    // Apply all validation rules (including array type check)
    for (const rule of this.rules) {
      const result = rule(value);
      if (!result.success) {
        return {
          success: false,
          error: this.customMessage || result.error
        };
      }
    }

    // Validate each item in the array
    if (this.itemValidator && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const itemResult = this.itemValidator.validate(value[i]);
        if (!itemResult.success) {
          return {
            success: false,
            error: `Item at index ${i}: ${itemResult.error}`
          };
        }
      }
    }

    return { success: true, value: value };
  }
}

/**
 * Object validator for validating objects and their properties
 */
class ObjectValidator extends Validator {
  constructor(schema) {
    super();
    this.schema = schema || {};
    
    // Add basic object type check
    this.rules.push((value) => {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { success: false, error: 'Value must be an object' };
      }
      return { success: true };
    });
  }

  /**
   * Validates a value against object rules and validates each property
   * @param {any} value - Value to validate
   * @returns {Object} - Validation result
   */
  validate(value) {
    // Handle optional fields first
    if (value === undefined || value === null) {
      if (this.isOptional) {
        return { success: true, value: value };
      }
      // For objects, null should be treated as a type error, not a required field error
      if (value === null) {
        return {
          success: false,
          error: this.customMessage || 'Value must be an object'
        };
      }
      return {
        success: false,
        error: this.customMessage || 'Field is required'
      };
    }

    // Apply all validation rules (including object type check)
    for (const rule of this.rules) {
      const result = rule(value);
      if (!result.success) {
        return {
          success: false,
          error: this.customMessage || result.error
        };
      }
    }

    // Validate each property according to schema
    if (typeof value === 'object' && value !== null) {
      for (const [key, validator] of Object.entries(this.schema)) {
        const propertyResult = validator.validate(value[key]);
        if (!propertyResult.success) {
          return {
            success: false,
            error: `Property '${key}': ${propertyResult.error}`
          };
        }
      }
    }

    return { success: true, value: value };
  }
}

/**
 * Main Schema class providing static factory methods for creating validators
 * This is the primary interface for the validation library
 */
class Schema {
  /**
   * Creates a string validator
   * @returns {StringValidator} - String validator instance
   */
  static string() {
    return new StringValidator();
  }
  
  /**
   * Creates a number validator
   * @returns {NumberValidator} - Number validator instance
   */
  static number() {
    return new NumberValidator();
  }
  
  /**
   * Creates a boolean validator
   * @returns {BooleanValidator} - Boolean validator instance
   */
  static boolean() {
    return new BooleanValidator();
  }
  
  /**
   * Creates a date validator
   * @returns {DateValidator} - Date validator instance
   */
  static date() {
    return new DateValidator();
  }
  
  /**
   * Creates an object validator with a schema
   * @param {Object} schema - Object schema defining property validators
   * @returns {ObjectValidator} - Object validator instance
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }
  
  /**
   * Creates an array validator
   * @param {Validator} itemValidator - Validator for array items
   * @returns {ArrayValidator} - Array validator instance
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }
}

// Example usage and complex schema definitions
const addressSchema = Schema.object({
  street: Schema.string().notEmpty(),
  city: Schema.string().notEmpty(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string().notEmpty()
});

const userSchema = Schema.object({
  id: Schema.string().notEmpty().withMessage('ID must be a non-empty string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  age: Schema.number().min(0).max(150).integer().optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()).minLength(1),
  address: addressSchema.optional(),
  metadata: Schema.object({}).optional()
});

// Export the Schema class and validator classes for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Schema,
    Validator,
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ArrayValidator,
    ObjectValidator,
    userSchema,
    addressSchema
  };
}

// Example validation usage
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Anytown",
    postalCode: "12345",
    country: "USA"
  }
};

// Uncomment the following line to test validation
// const result = userSchema.validate(userData);
// console.log('Validation result:', result);

'use client';

/**
 * Represents information about a name, including its validity.
 */
export interface NameInfo {
  /**
   * Indicates whether the name is valid or not.
   */
  isValid: boolean;
  /**
   * An optional message providing additional information about the name.
   */
  message?: string;
  /**
   * An optional suggested correction for an invalid name.
   */
  suggestion?: string;
}

/**
 * Represents a name correction entry
 */
export interface NameCorrection {
  /**
   * The original name
   */
  original: string;
  /**
   * The corrected name
   */
  corrected: string;
  /**
   * Whether a correction was made
   */
  needsCorrection: boolean;
  /**
   * Optional reason for the correction
   */
  reason?: string;
}

// List of common Indian first names and last names for validation
const commonIndianFirstNames = [
  'Aditya', 'Amit', 'Ananya', 'Arjun', 'Aryan', 'Aishwarya', 'Anil', 'Anjali',
  'Deepa', 'Deepak', 'Divya', 'Gaurav', 'Isha', 'Karan', 'Kavita', 'Krishna',
  'Manish', 'Meera', 'Mohan', 'Neha', 'Nikhil', 'Pooja', 'Priya', 'Rahul',
  'Raj', 'Rajesh', 'Rakesh', 'Ravi', 'Sachin', 'Sanjay', 'Sarika', 'Shikha',
  'Shiv', 'Sneha', 'Sunil', 'Sunita', 'Suresh', 'Tanvi', 'Varun', 'Vijay',
  'Vikram', 'Viren', 'Vivek', 'Yash'
];

const commonIndianLastNames = [
  'Agarwal', 'Bansal', 'Bhatia', 'Chauhan', 'Chopra', 'Das', 'Dutta', 'Gandhi',
  'Gupta', 'Jain', 'Joshi', 'Kapoor', 'Khan', 'Kumar', 'Malhotra', 'Mehta',
  'Mishra', 'Nair', 'Patel', 'Rao', 'Reddy', 'Saxena', 'Sharma', 'Singh',
  'Sinha', 'Verma', 'Yadav', 'Iyer', 'Pillai', 'Desai', 'Shah', 'Mukherjee',
  'Chatterjee', 'Bose', 'Banerjee', 'Patil', 'Kaur', 'Mehra', 'Menon', 'Gill'
];

// Regex patterns for validation
const nameRegexPattern = /^[A-Za-z\s.'-]+$/;
const specialCharPattern = /[^A-Za-z\s.'-]/;
const excessiveSpecialCharPattern = /[.'-]{2,}/;

// Name validation types
export interface NameValidationResult {
  isValid: boolean;
  name: string;
  confidence: number;
  issues: string[];
  suggestions: string[];
  message?: string;
}

// Common Indian naming patterns and rules
const commonIssues = {
  tooShort: 'Name is too short',
  noSpaces: 'Full name should contain at least first and last name',
  incorrectCapitalization: 'Name should be properly capitalized',
  specialCharacters: 'Name contains invalid special characters',
  numbersPresent: 'Name should not contain numbers',
  excessiveSpaces: 'Name contains excessive spaces',
  missingLastName: 'Indian names typically include a last name'
};

// Basic validation checks
const validateBasicRules = (name: string): { issues: string[], confidence: number } => {
  const issues: string[] = [];
  let confidence = 100;
  
  // Check name length
  if (name.length < 3) {
    issues.push(commonIssues.tooShort);
    confidence -= 30;
  }
  
  // Check for numbers
  if (/\d/.test(name)) {
    issues.push(commonIssues.numbersPresent);
    confidence -= 40;
  }
  
  // Check for invalid special characters (allowing periods and hyphens)
  if (/[^a-zA-Z\u0900-\u097F\s.\-]/u.test(name)) {
    issues.push(commonIssues.specialCharacters);
    confidence -= 30;
  }
  
  // Check for excessive spaces
  if (/\s{2,}/.test(name)) {
    issues.push(commonIssues.excessiveSpaces);
    confidence -= 15;
  }
  
  // Check for proper capitalization (each name part should be capitalized)
  const nameParts = name.trim().split(/\s+/);
  const allProperlyCapitalized = nameParts.every(part => 
    part.length > 0 && part[0] === part[0].toUpperCase() && part.slice(1) === part.slice(1).toLowerCase()
  );
  
  if (!allProperlyCapitalized) {
    issues.push(commonIssues.incorrectCapitalization);
    confidence -= 20;
  }
  
  // Check for full name (first and last name)
  if (nameParts.length < 2) {
    issues.push(commonIssues.missingLastName);
    confidence -= 15;
  }
  
  return { issues, confidence: Math.max(0, confidence) };
};

// Generate suggestions for fixing identified issues
const generateSuggestions = (name: string, issues: string[]): string[] => {
  const suggestions: string[] = [];
  const nameParts = name.trim().split(/\s+/);
  
  // Fix capitalization
  if (issues.includes(commonIssues.incorrectCapitalization)) {
    const properlyCapitalized = nameParts.map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
    
    suggestions.push(properlyCapitalized);
  }
  
  // Fix excessive spaces
  if (issues.includes(commonIssues.excessiveSpaces)) {
    const fixedSpaces = name.replace(/\s+/g, ' ').trim();
    suggestions.push(fixedSpaces);
  }
  
  // If name is missing last name, suggest common Indian last names
  if (issues.includes(commonIssues.missingLastName) && nameParts.length === 1) {
    const commonLastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Verma', 'Rao', 'Reddy', 'Nair', 'Joshi'];
    const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase();
    
    // Add 3 random last name suggestions
    for (let i = 0; i < 3; i++) {
      const randomLastName = commonLastNames[Math.floor(Math.random() * commonLastNames.length)];
      suggestions.push(`${firstName} ${randomLastName}`);
    }
  }
  
  return [...new Set(suggestions)]; // Remove duplicates
};

/**
 * Validates an Indian name and returns detailed validation results
 * @param name The name to validate
 * @returns Validation result with confidence score, issues, and suggestions
 */
export async function validateIndianName(name: string): Promise<NameValidationResult> {
  console.log(`[CLIENT] Validating Indian name: "${name}"`);
  
  // Basic input validation
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid input: Name must be a non-empty string');
  }
  
  // Trim the name to remove leading/trailing whitespace
  const trimmedName = name.trim();
  
  // Perform our own validation checks
  const { issues, confidence } = validateBasicRules(trimmedName);
  
  // Generate suggestions for improvement
  const suggestions = generateSuggestions(trimmedName, issues);
  
  // Determine if the name is valid based on confidence threshold
  const isValid = confidence > 70;
  
  // Create a summary message from the first issue (if any)
  const message = issues.length > 0 ? issues[0] : isValid ? 'Valid Indian name' : undefined;
  
  const result = {
    isValid,
    name: trimmedName,
    confidence,
    issues,
    suggestions,
    message
  };
  
  console.log(`[CLIENT] Validation result for "${name}":`, { isValid, confidence, issuesCount: issues.length });
  
  return result;
}

/**
 * Batch validates multiple Indian names or separate first and last names
 * @param firstParam Array of names or first names
 * @param lastNames Optional array of last names
 * @returns Array of validation results or object with first/last name corrections
 */
export async function batchValidateIndianNames(names: string[]): Promise<NameValidationResult[]>;
export async function batchValidateIndianNames(
  firstNames: string[], 
  lastNames: string[]
): Promise<{
  firstNameCorrections: NameCorrection[],
  lastNameCorrections: NameCorrection[]
}>;
export async function batchValidateIndianNames(
  firstParam: string[],
  secondParam?: string[]
): Promise<NameValidationResult[] | {
  firstNameCorrections: NameCorrection[],
  lastNameCorrections: NameCorrection[]
}> {
  // If only one parameter provided, it's the names array
  if (!secondParam) {
    console.log(`[CLIENT] Batch validating ${firstParam.length} names`);
    
    if (!Array.isArray(firstParam)) {
      throw new Error('Invalid input: Names must be provided as an array');
    }
    
    // Process each name in parallel
    const validationPromises = firstParam.map(name => validateIndianName(name));
    const results = await Promise.all(validationPromises);
    
    console.log(`[CLIENT] Completed batch validation of ${results.length} names`);
    
    return results;
  }
  
  // Otherwise, we're dealing with firstNames and lastNames
  const firstNames = firstParam;
  const lastNames = secondParam;
  
  console.log(`[CLIENT] Batch validating ${firstNames.length} first names and ${lastNames.length} last names`);
  
  // Process first names
  const firstNameCorrections: NameCorrection[] = [];
  for (const name of firstNames) {
    if (!name || name.trim() === '') {
      firstNameCorrections.push({
        original: name,
        corrected: name,
        needsCorrection: false
      });
      continue;
    }
    
    const validation = await validateIndianName(name);
    
    firstNameCorrections.push({
      original: name,
      corrected: validation.suggestions.length > 0 ? validation.suggestions[0] : name,
      needsCorrection: !validation.isValid,
      reason: validation.message
    });
  }
  
  // Process last names
  const lastNameCorrections: NameCorrection[] = [];
  for (const name of lastNames) {
    if (!name || name.trim() === '') {
      lastNameCorrections.push({
        original: name,
        corrected: name,
        needsCorrection: false
      });
      continue;
    }
    
    const validation = await validateIndianName(name);
    
    lastNameCorrections.push({
      original: name,
      corrected: validation.suggestions.length > 0 ? validation.suggestions[0] : name,
      needsCorrection: !validation.isValid,
      reason: validation.message
    });
  }
  
  console.log(`[CLIENT] Completed batch validation of ${firstNames.length} first names and ${lastNames.length} last names`);
  
  return {
    firstNameCorrections,
    lastNameCorrections
  };
}

'use client';

import { validateIndianName as validateSingleName, batchValidateIndianNames as batchValidate } from './indian-name-validator';

// Export the existing individual validation function
export const validateIndianName = async (name: string) => {
  try {
    return await validateSingleName(name);
  } catch (error) {
    console.error('Error validating individual name:', error);
    throw error;
  }
};

// Export the batch validation function
export const batchValidateIndianNames = async (firstNames: string[], lastNames: string[]) => {
  try {
    console.log(`Processing batch validation with ${firstNames.length} first names and ${lastNames.length} last names`);
    const result = await batchValidate(firstNames, lastNames);
    return result;
  } catch (error) {
    console.error('Error in batch validation:', error);
    throw error;
  }
};

// Optional test function to validate a set of predefined names
export const runTestCases = async () => {
  const testCases = [
    { name: 'Rajesh Kumar', expectedValid: true },
    { name: 'Aishwarya Rai', expectedValid: true },
    { name: 'Sachin Tendulkar', expectedValid: true },
    { name: 'John Smith', expectedValid: false },
    { name: 'Rajasekhar', expectedValid: true },
    { name: 'Agarwal', expectedValid: true },
    { name: 'R@jesh', expectedValid: false },
    { name: '123Kumar', expectedValid: false },
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const result = await validateIndianName(testCase.name);
      results.push({
        name: testCase.name,
        expected: testCase.expectedValid,
        actual: result.isValid,
        match: result.isValid === testCase.expectedValid,
        details: result
      });
    } catch (error) {
      results.push({
        name: testCase.name,
        expected: testCase.expectedValid,
        actual: false,
        match: !testCase.expectedValid,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  return results;
};

// Sample Indian names with variations to test
const testNames = [
  "Rajesh Kumar",         // Correct name
  "rajesh kumar",         // Capitalization issue
  "rAJESH kuMAR",         // Mixed case
  "Rajesh Kumarr",        // Typo in last name
  "Rajsh Kumar",          // Typo in first name
  "Ananya Sharma",        // Correct female name
  "Ananya Shrma",         // Typo in last name
  "Anaya Sharma",         // Typo in first name
  "Raajesh Kumar Singh",  // Three-part name with typo
  "Singh Rajesh",         // Reversed name
  "John Smith",           // Non-Indian name
];

/**
 * Run a test on the name validator with sample data
 */
export async function testNameValidator() {
  console.log("=== Testing Indian Name Validator ===");
  
  for (const name of testNames) {
    console.log(`\nTesting: "${name}"`);
    
    const startTime = performance.now();
    const result = await validateIndianName(name);
    const endTime = performance.now();
    
    console.log(`Result: ${result.isValid ? 'Valid' : 'Invalid'}`);
    console.log(`Confidence: ${result.confidence}%`);
    if (result.issues.length > 0) console.log(`Issues: ${result.issues.join(', ')}`);
    if (result.suggestions) console.log(`Suggestions: ${result.suggestions.join(', ')}`);
    console.log(`Time taken: ${(endTime - startTime).toFixed(2)}ms`);
  }
  
  console.log("\n=== Test Complete ===");
} 
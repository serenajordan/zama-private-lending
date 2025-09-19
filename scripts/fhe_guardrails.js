#!/usr/bin/env node

/**
 * FHE Guardrails Script
 * 
 * Prevents dangerous patterns in FHE contracts:
 * 1. On-chain TFHE.decrypt() calls (privacy leak)
 * 2. Raw operators on encrypted types (should use FHE.* functions)
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONTRACTS_DIR = path.join(__dirname, '..', 'contracts', 'contracts');
const SOLIDITY_EXT = '.sol';

// Patterns to detect and reject
const DANGEROUS_PATTERNS = [
  {
    name: 'On-chain TFHE.decrypt',
    pattern: /TFHE\.decrypt\s*\(/g,
    message: 'TFHE.decrypt() calls are forbidden in contracts - they leak privacy on-chain'
  }
];

// Raw operators that should not be used with encrypted types
const RAW_OPERATORS = [
  '+', '-', '*', '/', '<', '<=', '>', '>=', '==', '!='
];

// Encrypted types that should use FHE functions
const ENCRYPTED_TYPES = ['euint8', 'euint16', 'euint32', 'euint64', 'ebool'];

/**
 * Recursively find all Solidity files
 */
function findSolidityFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Directory ${dir} does not exist`);
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findSolidityFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(SOLIDITY_EXT)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Check for raw operators on encrypted types
 */
function checkRawOperators(content, filePath) {
  const errors = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Skip comments and strings
    if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;
    
    // Look for encrypted type declarations or usage
    for (const encryptedType of ENCRYPTED_TYPES) {
      // Find lines that contain the encrypted type
      if (line.includes(encryptedType)) {
        // Check for raw operators in the same line or nearby context
        for (const operator of RAW_OPERATORS) {
          // Create a more specific pattern that looks for the operator near encrypted types
          const operatorPattern = new RegExp(`\\b${operator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
          
          if (operatorPattern.test(line)) {
            // Additional check: make sure it's not in a comment or string
            const beforeOperator = line.substring(0, line.indexOf(operator));
            const commentIndex = Math.max(
              beforeOperator.lastIndexOf('//'),
              beforeOperator.lastIndexOf('/*')
            );
            
            if (commentIndex === -1 || commentIndex < beforeOperator.lastIndexOf(encryptedType)) {
              errors.push({
                file: filePath,
                line: lineNum,
                message: `Raw operator '${operator}' used with encrypted type '${encryptedType}'. Use FHE functions instead (e.g., FHE.add, FHE.sub, FHE.lt, etc.)`,
                code: line.trim()
              });
            }
          }
        }
      }
    }
  }
  
  return errors;
}

/**
 * Check file for dangerous patterns
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  
  // Check for dangerous patterns
  for (const { name, pattern, message } of DANGEROUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          errors.push({
            file: filePath,
            line: i + 1,
            message: `${name}: ${message}`,
            code: lines[i].trim()
          });
        }
      }
    }
  }
  
  // Check for raw operators on encrypted types
  errors.push(...checkRawOperators(content, filePath));
  
  return errors;
}

/**
 * Main guardrails function
 */
function runGuardrails() {
  console.log('🔒 Running FHE Guardrails...\n');
  
  const solidityFiles = findSolidityFiles(CONTRACTS_DIR);
  
  if (solidityFiles.length === 0) {
    console.log(`No Solidity files found in ${CONTRACTS_DIR}`);
    return true;
  }
  
  console.log(`Found ${solidityFiles.length} Solidity files:`);
  solidityFiles.forEach(file => {
    console.log(`  - ${path.relative(process.cwd(), file)}`);
  });
  console.log('');
  
  let allErrors = [];
  
  for (const file of solidityFiles) {
    const errors = checkFile(file);
    allErrors.push(...errors);
  }
  
  if (allErrors.length === 0) {
    console.log('✅ All FHE guardrails passed!');
    console.log('   - No on-chain TFHE.decrypt() calls found');
    console.log('   - No raw operators on encrypted types found');
    return true;
  }
  
  console.log('❌ FHE Guardrails failed!\n');
  
  // Group errors by file
  const errorsByFile = {};
  for (const error of allErrors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }
  
  // Print errors
  for (const [file, errors] of Object.entries(errorsByFile)) {
    console.log(`📄 ${path.relative(process.cwd(), file)}:`);
    for (const error of errors) {
      console.log(`   Line ${error.line}: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log('');
    }
  }
  
  console.log(`\n💡 Fix suggestions:`);
  console.log(`   - Replace TFHE.decrypt() with client-side decryption`);
  console.log(`   - Use FHE.add(), FHE.sub(), FHE.mul(), FHE.div() for arithmetic`);
  console.log(`   - Use FHE.lt(), FHE.le(), FHE.gt(), FHE.ge(), FHE.eq(), FHE.ne() for comparisons`);
  
  return false;
}

// Run if called directly
if (require.main === module) {
  const success = runGuardrails();
  process.exit(success ? 0 : 1);
}

module.exports = { runGuardrails };

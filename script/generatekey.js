import crypto from 'crypto';

// Generate a random 32-byte key and convert it to hexadecimal
const jwtSecretKey = crypto.randomBytes(32).toString('hex');

// Display the generated key in the terminal
console.log(`JWT Secret Key: ${jwtSecretKey}`);
import fs from 'fs';
import { execSync } from 'child_process';

try {
  execSync('npx eslint . --format json', { maxBuffer: 1024 * 1024 * 100, encoding: 'utf-8' });
  console.log("No ESLint errors.");
} catch (error) {
  if (error.stdout) {
    try {
      const results = JSON.parse(error.stdout);
      const ruleCounts = {};
      const fileCounts = {};
      
      for (const file of results) {
        if (file.messages.length > 0) {
          fileCounts[file.filePath] = file.messages.length;
        }
        for (const msg of file.messages) {
          const ruleId = msg.ruleId || 'unknown';
          ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
        }
      }
      
      console.log("Top rules violated:");
      const sortedRules = Object.entries(ruleCounts).sort((a, b) => b[1] - a[1]);
      for (const [rule, count] of sortedRules.slice(0, 15)) {
        console.log(`${rule}: ${count}`);
      }
      
      console.log("\nTop files with errors:");
      const sortedFiles = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]);
      for (const [file, count] of sortedFiles.slice(0, 10)) {
        console.log(`${file}: ${count}`);
      }
    } catch (parseError) {
      console.error("Error parsing ESLint JSON output:", parseError.message);
    }
  } else {
    console.error("An error occurred executing ESLint:");
    console.error(error.message);
  }
}

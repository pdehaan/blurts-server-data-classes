#!/usr/bin/env node

const lib = require("./lib");

main();

async function main(ftlFile) {
  const missingDataClasses = await lib.getMissingDataClasses();
  if (missingDataClasses.length) {
    for (const res of missingDataClasses) {
      console.error(`Missing "${res.dataClass}" data class from ${res.breachName} breach`);
    }
    process.exitCode = 1;
  }
}

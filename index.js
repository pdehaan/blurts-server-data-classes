#!/usr/bin/env node

const lib = require("./lib");

main("locales/en/data-classes.ftl");

async function main(ftlFile) {
  const missingDataClasses = lib.getMissingDataClasses(ftlFile);
  if (missingDataClasses.length) {
    console.error(`${ftlFile}:`);
    for (const dataClass of missingDataClasses) {
      console.error(`  - Missing "${dataClass}"`);
    }
    process.exitCode = 1;
  }
}

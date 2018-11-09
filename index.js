#!/usr/bin/env node

const lib = require("./lib");

main("locales/en/data-classes.ftl");

async function main(ftlFile) {
  const breachDataClasses = new Set();
  // const ftlDataClasses = getFtlDataClassesLocal(`./${ftlFile}`);
  const ftlDataClasses = await lib.getFtlDataClassesRemote(`https://raw.githubusercontent.com/mozilla/blurts-server/master/${ftlFile}`);
  const breaches = await lib.getHibpBreaches();
  breaches.forEach(({DataClasses}) => DataClasses.forEach(dataClass => breachDataClasses.add(dataClass)));

  breachDataClasses.forEach(dataClass => {
    if (!ftlDataClasses.has(dataClass)) {
      console.error(`Missing "${dataClass}" in ${ftlFile}.`);
      process.exitCode = 1;
    }
  });
}

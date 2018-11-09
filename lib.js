const readFile = require("fs").readFileSync;

const {parse} = require("fluent-syntax");
const got = require("got").get;

const HIBP_BREACHES_URL = "https://haveibeenpwned.com/api/v2/breaches";

module.exports = {
  getFtlDataClassesLocal,
  getFtlDataClassesRemote,
  getMissingDataClasses
};

async function fetch(url, options={}) {
  const {body} = await got(url, options);
  return body;
}

function dataClassMap(ftl) {
  const res = parse(ftl).body;
  return res.reduce(ftlReducer, new Map());
}

function getFtlDataClassesLocal(p) {
  const file = readFile(p, "utf-8");
  return dataClassMap(file);
}

async function getFtlDataClassesRemote(u) {
  const file = await fetch(u);
  return dataClassMap(file);
}

function ftlReducer(list, {type, id, value}) {
  if (type === "Message") {
    const slug = id.name;
    const dataClass = value.elements.map(({value}) => value.replace("’", "'")).join("");
    list.set(dataClass, slug);
  }
  return list;
}

async function getMissingDataClasses(ftlFile) {
  const breachDataClasses = new Set();
  // const ftlDataClasses = getFtlDataClassesLocal(`./${ftlFile}`);
  const ftlDataClasses = await getFtlDataClassesRemote(`https://raw.githubusercontent.com/mozilla/blurts-server/master/${ftlFile}`);
  const breaches = await fetch(HIBP_BREACHES_URL, {json: true});
  breaches.forEach(({DataClasses}) => DataClasses.forEach(dataClass => breachDataClasses.add(dataClass)));

  const missingDataClasses = [];
  breachDataClasses.forEach(dataClass => {
    if (!ftlDataClasses.has(dataClass)) {
      missingDataClasses.push(dataClass);
    }
  });
  return missingDataClasses;
}

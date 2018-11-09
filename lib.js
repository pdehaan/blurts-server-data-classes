const readFile = require("fs").readFileSync;

const {parse} = require("fluent-syntax");
const got = require("got").get;

const HIBP_BREACHES_URL = "https://haveibeenpwned.com/api/v2/breaches";

module.exports = {
  getFtlDataClassesLocal,
  getFtlDataClassesRemote,
  getHibpBreaches
};

async function getHibpBreaches(u=HIBP_BREACHES_URL) {
  return (await got(u, {json: true})).body;
}

function ftlToJson(ftl) {
  return parse(ftl).body;
}

function getFtlDataClassesLocal(p) {
  const file = readFile(p, "utf-8");
  return ftlToJson(file)
    .reduce(ftlReducer, new Map());
}

async function getFtlDataClassesRemote(u) {
  const file = (await got(u)).body;
  return ftlToJson(file)
    .reduce(ftlReducer, new Map());
}

function ftlReducer(list, {type, id, value}) {
  if (type === "Message") {
    const slug = id.name;
    const dataClass = value.elements.map(({value}) => value.replace("’", "'")).join("");
    list.set(dataClass, slug);
  }
  return list;
}

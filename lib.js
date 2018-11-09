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

function getFtlDataClassesLocal(p) {
  const ftlToJsonLocal = (p) => {
    const res = readFile(p, "utf-8");
    return parse(res).body;
  };
  return ftlToJsonLocal(p)
    .reduce(ftlReducer, new Map());
}

async function getFtlDataClassesRemote(u) {
  const ftlToJsonRemote = async (u) => {
    const res = (await got(u)).body;
    return parse(res).body;
  };
  return (await ftlToJsonRemote(u))
    .reduce(ftlReducer, new Map());
}

function ftlReducer(list, item) {
  if (item.type === "Message") {
    const slug = item.id.name;
    const dataClass = item.value.elements.map(({value}) => value.replace("’", "'")).join("");
    list.set(dataClass, slug);
  }
  return list;
}

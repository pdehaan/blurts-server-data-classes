const got = require("got").get;
const parseFtl = require("fluent-syntax").parse;

module.exports = {
  getMissingDataClasses
};

async function getMissingDataClasses() {
  const breaches = await getHibpBreaches();
  const enFtl = await getFTLFile("en");
  const ftlIds = ftlIdentifiers(enFtl);

  const missingDataClasses = [];

  breaches.forEach(breach => {
    breach.DataClasses.forEach(dataClass => {
      dataClass = matchFluentID(dataClass);
      if (!ftlIds.has(dataClass)) {
        missingDataClasses.push({
          dataClass,
          breachName: breach.Name
        });
      }
    });
  });
  return missingDataClasses;
}

function matchFluentID(dataCategory) {
  return dataCategory.toLowerCase()
    .replace(/[^-a-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getHibpBreaches(breachesUrl="https://haveibeenpwned.com/api/v2/breaches") {
  const res = await got(breachesUrl, {json: true});
  return res.body;
}

async function getFTLFile(locale="en") {
  const res = await got(`https://raw.githubusercontent.com/mozilla/blurts-server/master/locales/${locale}/data-classes.ftl`);
  return parseFtl(res.body).body.filter(item => item.type === "Message");
}

function ftlIdentifiers(ftl) {
  return new Set(ftl.map(item => item.id.name));
}

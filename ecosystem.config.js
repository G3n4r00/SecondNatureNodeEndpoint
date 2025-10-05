module.exports = {
  apps: [{
    name: "betware-api",
    script: "index.js",
    user: "betwareservices",    // The user PM2 run the app as
    group: "betwareservices",   // The group PM2 run the app as
  }]
};
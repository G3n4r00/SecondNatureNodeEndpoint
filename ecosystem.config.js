module.exports = {
  apps: [{
    name: "betware-api",
    script: "/srv/betware-api/index.js", 
    cwd: "/srv/betware-api/",             // Set the current working directory
    user: "betwareservices",
    group: "betwareservices",
  }]
};
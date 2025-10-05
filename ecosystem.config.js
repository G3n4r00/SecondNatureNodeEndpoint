module.exports = {
  apps: [{
    name: "betware-api",
    script: "/srv/betware-api/index.js", 
    cwd: "/srv/betware-api/",       
    user: "betwareservices",
    group: "betwareservices",
  }]
};
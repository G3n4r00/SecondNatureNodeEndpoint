module.exports = {
  apps: [{
    name: "betware-api",
    script: "/srv/betware-api/SecondNatureEndpoint/index.js", 
    cwd: "/srv/betware-api/SecondNatureEndpoint/",       
    user: "betwareservices",
    group: "betwareservices",
  }]
};
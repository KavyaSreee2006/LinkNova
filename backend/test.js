const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.kavyasree.xs2k4iz.mongodb.net",
  (err, addresses) => {
    console.log("ERR:", err);
    console.log("ADDR:", addresses);
  }
);
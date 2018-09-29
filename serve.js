var Protocolo = require('./class/protocolo');

var a = new Protocolo({
  eu:{
    host:"127.0.0.1",
    port:8988,
    name:"serve"
  },
  ele:{
    host:"127.0.0.1",
    port:8989
  }
});

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  a.envia(d.toString().trim());
});
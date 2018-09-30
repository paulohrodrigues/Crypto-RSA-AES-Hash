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

// a.setAlgoritmos(
//   {"cesar":
//     {
//       "cry":(text,pwd)=>{
//         return new Buffer(text).toString("base64");
//       },"de":(text,pwd)=>{
//         // console.log("aqui");
//         // console.log(text);
//         // console.log(new Buffer(JSON.stringify(text),"base64").toString("ascii"));
//         return new Buffer(JSON.stringify(text),"base64").toString("ascii");
//       }
//     }
//   }
// );

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  a.envia(d.toString().trim());
});
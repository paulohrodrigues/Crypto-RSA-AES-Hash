var Protocolo = require('./class/protocolo');

var a = new Protocolo({
  ele:{
    host:"127.0.0.1",
    port:8988
  },
  eu:{
    host:"127.0.0.1",
    port:8989,
    name:"client"
  }
});

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  a.envia(d.toString().trim()); 
});








// var crypto             = require('crypto');
// var r_pass = crypto.randomBytes(128);
// var r_pass_base64 = r_pass.toString("base64");

// var node_cryptojs = require('node-cryptojs-aes');
// var CryptoJS = node_cryptojs.CryptoJS;
// var JsonFormatter = node_cryptojs.JsonFormatter;
// var message = "I love maccas!";
// var encrypted = CryptoJS.AES.encrypt(message, r_pass_base64, { format: JsonFormatter });
// var encrypted_json_str = encrypted;


// console.log("serialized CipherParams object: ");
// console.log(encrypted_json_str);


// var decrypted = CryptoJS.AES.decrypt(encrypted_json_str, r_pass_base64, { format: JsonFormatter });

// console.log(CryptoJS.enc.Utf8.stringify(decrypted));

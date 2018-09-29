"use strict";
module.exports = class Crypt{

    constructor(name){

        let fs                  = require('fs');

        this.r                  = Math.floor((Math.random() * 100000000) + 10000000);
        this.keyPrivate         = fs.readFileSync('./keys/'+name+'/chave.key');
        this.keyPublic          = fs.readFileSync('./keys/'+name+'/chave.pub');
        this.crypto             = require('crypto');
        this.RSAKeyPub          = "";
        this.RSAKeyPriv         = "";
        this.listaAlgoritmos    = {
            "simetrico":["aes"],
            "assimetrico":["rsa"],
            "hash":["md5"]
        };
    }

    geraChaveSimetrica(){
        var r_pass          = this.crypto.randomBytes(128);
        var r_pass_base64   = r_pass.toString("base64");
        return r_pass_base64;
    }

    getChave(type){
        if(type=="pub"){
            return this.keyPublic; 
        }else if(type=="priv"){
            return this.keyPrivate;
        }
        return false;
    }

    getTypeAlg(){
        return this.listaAlgoritmos;
    }

    cryptSim(text,pwd,type="aes"){
    
        var node_cryptojs   = require('node-cryptojs-aes');
        var CryptoJS        = node_cryptojs.CryptoJS;
        var JsonFormatter   = node_cryptojs.JsonFormatter;
        var encrypted       = CryptoJS.AES.encrypt(text, pwd, { format: JsonFormatter });
        return encrypted.toString();
    }
    decryptSim(text,pwd,type="aes"){
        
        var node_cryptojs   = require('node-cryptojs-aes');
        var CryptoJS        = node_cryptojs.CryptoJS;
        var JsonFormatter   = node_cryptojs.JsonFormatter;
        var decrypted = CryptoJS.AES.decrypt(text, pwd, { format: JsonFormatter });
        
        return CryptoJS.enc.Utf8.stringify(decrypted);

    }

    cryptAss(text,type_key,key=null,type="rsa"){
        if(type_key=="pub"){
            key=(key==null) ? this.keyPublic.toString(): key.toString();
            let encrypted = this.crypto.publicEncrypt(key,new Buffer(text));
            return (encrypted);
        }else if(type_key=="priv"){
            key=(key==null) ? this.keyPrivate.toString(): key.toString();
            let encrypted = this.crypto.privateEncrypt(key,new Buffer(text)); 
            return (encrypted)
        }else{
            return false;
        }
    }

    decryptAss(text,type_key,key=null,type="rsa"){
        if(type_key=="pub"){
            key=(key==null) ? this.keyPublic.toString(): key.toString();
            let encrypted = this.crypto.publicDecrypt(key,text);
            return (encrypted.toString());
        }else if(type_key=="priv"){
            key=(key==null) ? this.keyPrivate.toString(): key.toString();
            let encrypted = this.crypto.privateDecrypt(this.keyPrivate.toString(),text);
            return (encrypted.toString());
        }else{
            return false;
        }
    }

    hash(data,type="md5"){
        return this.crypto.createHash(type).update(data).digest("hex");
    }

}
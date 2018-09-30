"use strict";
module.exports = class Protocolo{
    constructor(comunicantes){
        let Crypt               = require('./crypt'); 
        this.crypt              = new Crypt(comunicantes.eu.name);
        this.net                = require('net');
        this.ativo              = false;
        this.client             = new this.net.Socket();
        this.comunicantes       = comunicantes;
        this.tentou_enviar      = false;
        this.client_connected   = false;
        this.buffer             = "";
        this.chave_simetrica_que_vai_ser_usada = this.crypt.geraChaveSimetrica();
        this.protocoloJson={
            hash:this.crypt.getTypeAlg()["hash"],
            simetrica:this.crypt.getTypeAlg()["simetrico"],
            assimetrica:this.crypt.getTypeAlg()["assimetrico"],
            comunicantes,
            type:"connection-1"
        }
        this.recebe();
        this.crypt.CAAssina(this.crypt.certifica(comunicantes.eu.host,comunicantes.eu.port,this.crypt.getChave("pub")));
    }

    verifica(){
        // console.log(this.protocoloJson);
        return new Promise((resolve)=>{
            if(this.ativo===true){
                resolve(true);
            }else{ 
                if(this.tentou_enviar==false){
                    this.tentou_enviar=true;
                    // console.log(33);
                    // console.log(this.crypt.getTypeAlg()["simetrico"]);
                    this.protocoloJson={
                        hash:this.crypt.getTypeAlg()["hash"],
                        simetrica:this.crypt.getTypeAlg()["simetrico"],
                        assimetrica:this.crypt.getTypeAlg()["assimetrico"],
                        comunicantes:this.comunicantes,
                        type:"connection-1"
                    }
                    this.enviarMensagemPadrao(this.protocoloJson);
                }
                resolve(false);
            }
        });
    }

    setAlgoritmos(simetrico=null,assimetrico=null,hash=null){
        if(hash!=null){
            this.crypt.listaAlgoritmos["hash"]   = Object.keys(hash);
            this.crypt.algoritmos["hash"]        = hash;
        }
        if(simetrico!=null){
            this.crypt.listaAlgoritmos["simetrico"]   = Object.keys(simetrico);
            // console.log(this.crypt.listaAlgoritmos["simetrico"]);
            this.crypt.algoritmos["simetrico"]        = simetrico;
            // console.log(this.crypt.algoritmos["simetrico"]);

            // console.log(this.crypt.algoritmos["simetrico"]["cesar"]["cry"](1,2));

        }
        if(assimetrico!=null){
            this.crypt.listaAlgoritmos["assimetrico"]   = Object.keys(assimetrico);
            this.crypt.algoritmos["assimetrico"]        = assimetrico;
        }
    }


    envia(mensagem){
        // console.log(this.chave_simetrica_que_vai_ser_usada);
        this.verifica(mensagem).then((r)=>{
            if(this.ativo==true){
                ++this.crypt.nonce;

                // console.log(this.crypt.algoritimosQueVaoSerUsados["simetrico"]);
                this.client.write(this.crypt.algoritmos["simetrico"][this.crypt.algoritimosQueVaoSerUsados["simetrico"]]["cry"](JSON.stringify({
                    data:mensagem,
                    type:"mensagem",
                    r:parseInt(this.crypt.nonce)
                }),this.chave_simetrica_que_vai_ser_usada ));
            }else{
                this.buffer = mensagem;
            }
        });
    }

    enviarMensagemPadrao(data){
        return new Promise((resolve)=>{
            if(this.client_connected===false){
                this.client_connected=true;
                this.client.connect(this.comunicantes.ele.port, this.comunicantes.ele.host,()=>{
                    this.client.write(JSON.stringify(data));
                    resolve(true);
                });
            }else{
                this.client.write(JSON.stringify(data));
                resolve(true);
            }
        });
    }

    connection(data){
        // console.log(data);
        // return;
        try{
            var data = JSON.parse(data);
        }catch(e){
            // var data={"data":"teste"};
        }

        if(data.type==="connection-1"){
            var hash="";
            var simetrica="";
            var assimetrica="";

            this.protocoloJson={
                hash:this.crypt.getTypeAlg()["hash"],
                simetrica:this.crypt.getTypeAlg()["simetrico"],
                assimetrica:this.crypt.getTypeAlg()["assimetrico"],
                comunicantes:this.comunicantes,
                type:"connection-1"
            }


            for(let item in this.protocoloJson["hash"]){
                if(data.hash.indexOf(this.protocoloJson["hash"][item])!=-1){
                    hash = this.protocoloJson["hash"][item];
                    break;
                }
            }
            // console.log(112);
            // console.log(this.protocoloJson["simetrica"]);
            
            for(let item in this.protocoloJson["simetrica"]){
                // console.log(this.protocoloJson["simetrica"][item]);
                // console.log(data.simetrica.indexOf(this.protocoloJson["simetrica"][item])!=-1);
                if(data.simetrica.indexOf(this.protocoloJson["simetrica"][item])!=-1){
                    simetrica = this.protocoloJson["simetrica"][item];
                    break;
                }
            }
            for(let item in this.protocoloJson["assimetrica"]){
                if(data.assimetrica.indexOf(this.protocoloJson["assimetrica"][item])!=-1){
                    assimetrica = this.protocoloJson["assimetrica"][item];
                    break;
                }
            }
            var type="ok-1";
            if(hash == "" || simetrica == "" || assimetrica == ""){
                type="erro";
                let mensagemErro = "Não foi possivel fazer a conexão, pois os algoritmos não são compativeis";
                console.log("Não foi possivel fazer a conexão, pois os algoritmos não são compativeis");
                
                this.enviarMensagemPadrao({type,mensagemErro});
                return false;
            }else{
                this.crypt.algoritimosQueVaoSerUsados["hash"]           = hash;
                this.crypt.algoritimosQueVaoSerUsados["simetrico"]      = simetrica;
                this.crypt.algoritimosQueVaoSerUsados["assimetrico"]    = assimetrica;
                // console.log(159);
                // console.log(this.crypt.algoritimosQueVaoSerUsados["simetrico"]);
            }
            let acordo = {
                hash,
                simetrica,
                assimetrica,
                type,
                certificado:this.crypt.getCertificado()
            };
            
            this.enviarMensagemPadrao(acordo);

            return false;
        }
        if(data.type=="erro"){
            console.log(data.mensagemErro);
            // console.log("Não foi possivel fazer a conexão");
            return false;
        }
        if(data.type==="ok-1"){
            // this.crypt.cryptAss(this.chave_simetrica_que_vai_ser_usada,"pub",new Buffer(data.chave_pub))
            var resultCertificadoRecebido = this.crypt.verificaAssinaturaCA(data.certificado,this.comunicantes.ele.host,this.comunicantes.ele.port);
            if(resultCertificadoRecebido.status==false){
                console.log("Não foi possivel Connectar");
                return false;
            }

            this.crypt.algoritimosQueVaoSerUsados["hash"]           = data.hash;
            this.crypt.algoritimosQueVaoSerUsados["simetrico"]      = data.simetrica;
            this.crypt.algoritimosQueVaoSerUsados["assimetrico"]    = data.assimetrica;

            let acordo = {
                certificado: this.crypt.getCertificado(),
                type:"ok-2",
                data:this.buffer,
                r:this.crypt.cryptAss(this.crypt.nonce.toString(),"pub",new Buffer(data.certificado["key_pub"]))
            };
            this.comunicantes.ele["certificado"]=data.certificado;
            this.enviarMensagemPadrao(acordo);
            // this.ativo=true;
            // console.log("Pronto para Trocar Mensagem");
            return false;
            
        }


        if(data.type==="ok-2"){
            if(data.type=="erro"){
                console.log("Não foi possivel fazer a conexão");
                return false;
            }else{
                var resultCertificadoRecebido = this.crypt.verificaAssinaturaCA(data.certificado,this.comunicantes.ele.host,this.comunicantes.ele.port);
                if(resultCertificadoRecebido.status==false){
                    console.log("Não foi possivel Connectar");
                    return false;
                }

                let acordo = {
                    simetrica: this.crypt.cryptAss(JSON.stringify({"simetrica":this.chave_simetrica_que_vai_ser_usada,r:this.crypt.nonce}),"pub",new Buffer(data.certificado["key_pub"])),
                    type:"end"
                };
                this.comunicantes.ele["certificado"]=data.certificado;
                
                this.comunicantes.ele["r"] = parseInt(this.crypt.decryptAss(new Buffer(data.r),"priv").toString());
                
                this.enviarMensagemPadrao(acordo);
                this.ativo=true;
                console.log(data.data);
                console.log("Pronto para Trocar Mensagem");
                return false;
            }
        }
        
        if(data.type==="end"){
            var json = JSON.parse(this.crypt.decryptAss(new Buffer(data.simetrica),"priv").toString());
            this.comunicantes.ele["r"] = json.r;
            this.chave_simetrica_que_vai_ser_usada = json.simetrica;
            this.ativo=true;
            // console.log(data.data);
            console.log("Pronto para Trocar Mensagem");
            return false;
        }
        // if(data.ct){
        // console.log(JSON.stringify(data));
        let decrypt = JSON.parse( this.crypt.algoritmos["simetrico"][this.crypt.algoritimosQueVaoSerUsados["simetrico"]]["de"](data,this.chave_simetrica_que_vai_ser_usada) );
        // console.log(decrypt);
        if(decrypt.type==="mensagem"){
            if(decrypt.r==this.comunicantes.ele["r"]+1){
                this.comunicantes.ele["r"]++;
                console.log("Mensagem ao Vivo");
            }else{
                console.log("Mensagem descartada por está vencida ou invalida");
                return false;
            }
        }else{
            console.log("Tipo inválido para esse protocolo");
            return false;
        }
        // }
        // console.log(data);
        return true;
    }

    recebe(){
        this.net.createServer((sock)=>{
            sock.on('data',(data)=>{
                data = data.toString();
                // console.log(data);
                if(this.connection(data)){
                    // console.log(data);
                    try{
                        data = JSON.parse(data);
                    }catch(e){
                        
                    }
                    data = JSON.parse( this.crypt.algoritmos["simetrico"][this.crypt.algoritimosQueVaoSerUsados["simetrico"]]["de"](data,this.chave_simetrica_que_vai_ser_usada) );
                    console.log(data.data);

                }
            });
        }).listen(this.comunicantes.eu.port, this.comunicantes.eu.host);
    }
}
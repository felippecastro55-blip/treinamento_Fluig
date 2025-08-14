function createDataset(fields, constraints, sortFields) {
	log.info('uf-log | Inicio da chamada do dataset ds_apiConsulta.js')
	var dataset = DatasetBuilder.newDataset();
	dataset.addColumn('ERRO')
	dataset.addColumn('RETORNO')
	var resposta = '{}'
	var erro = 0
	var info = undefined
	try{
		//define os parametros
		info = JSON.parse(fields[0])
		var type = (info.type || info.TYPE || info.method || info.METHOD).toUpperCase()
		var headers = (info.headers || info.HEADERS || {})
		var data = info.data || info.DATA	// body da requisicao
		var URL = info.url || info.URL;
		log.info('uf-log | Parametros enviados para a api')
		log.dir(info)
		
		var client = new org.apache.commons.httpclient.HttpClient();
		var method = undefined
		// define qual metodo usar
		switch(type){
			case 'GET':
				method = new org.apache.commons.httpclient.methods.GetMethod(URL);
			break;
			case 'POST':
				method = new org.apache.commons.httpclient.methods.PostMethod(URL);
			break;
		}
		// valida se o metodo foi encontrado
		if(method != undefined){
			
			// se existe body na requisicao ele eh colocado
			if(data != undefined)
				method = addBody(method,data)
			// adiciona os headers
			method = addHeaders(method,headers)
			// executa o metodo
			client.executeMethod(method);
			var resposta = method.getResponseBodyAsString();
		}else{
			erro = 1
			var objError = { message: 'Nao foi possivel encontrar o metodo executado' }
			resposta = JSON.stringify(objError)
			log.info('uf-log | Nao foi possivel encontrar o metodo executado')
		}
		
	}catch(err){
		log.info('uf-log | Ocorreu um erro ao consultar a API:')
		if(info != undefined){
			log.info('uf-log | Parametros enviados:')
			log.dir(info)
		}else{
			log.info('uf-log | Ocorreu um erro nos parametros enviados:')
			log.dir(fields[0])
		}
		log.info('uf-log | Stack do erro:')
		log.error(err)
		var objError = { message: err.message }
		resposta = JSON.stringify(objError)
		erro = 1
	}
	// a variavel resposta sempre eh o stringify de um objeto
	// dessa forma sempre usar o parse nela
	dataset.addRow([erro,resposta])
	log.info('uf-log | Fim da chamada do dataset ds_apiConsulta.js')
	return dataset
}
function addHeaders(method,headers){
	for(var key in headers){
		method.addRequestHeader(String(key),String(headers[key]))
	}
	return method
}
function addBody(method,data){
	data = JSON.stringify(data)
	var requestBody = new org.apache.commons.httpclient.methods.StringRequestEntity(data);
	method.setRequestEntity(requestBody);
	return method
}
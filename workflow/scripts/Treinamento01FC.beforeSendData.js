function beforeSendData(customFields,customFacts){
	var atvAtual = getValue('WKCurrentState');
    log.dir('### uf-log | Início ufBase.beforeSendData.js (atvAtual: ' + atvAtual + ') ###');
	
    // Atualiza o status das atividades em andamento
	var lstAtiv = {
	    4: {
	        tit: 'Início',
	    },
	    5: {
	    	tit: 'Em Aprovação',
        },
		7: {
	    	tit: 'Ajuste Solic Férias',
        },
	   
	};
	hAPI.setCardValue("STATUSCOD", atvAtual);
    hAPI.setCardValue("STATUS", lstAtiv[atvAtual].tit);
    log.info('### uf-log | Fim da Chamada do ufBase.beforeSendData.js (atvAtual: ' + atvAtual + ' ###')
}

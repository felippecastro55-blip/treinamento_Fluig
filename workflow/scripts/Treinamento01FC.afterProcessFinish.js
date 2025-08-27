function afterProcessFinish(processId){
	var atvAtual = getValue('WKCurrentState');
    log.dir('### uf-log | Início ufBase.afterProcessFinish.js (atvAtual: ' + atvAtual + ') ###');
	
    // Lista com os possíveis status de finalizado
	var lstAtiv = {
        8: {
	    	tit: 'Solicitação Finalizada',
        }
	   
	};
	hAPI.setCardValue("STATUSCOD", atvAtual);
    hAPI.setCardValue("STATUS", lstAtiv[atvAtual].tit);
    log.info('### uf-log | Fim da Chamada do ufBase.afterProcessFinish.js (atvAtual: ' + atvAtual + ' ###')
}
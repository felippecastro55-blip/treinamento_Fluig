/**
 *
 * @desc        Script que será executado logo após a criação da solicitação no Fluig
 * @copyright   2018 upFlow.me
 * @version     1.0.0
 * @author      Helbert Campos <helbert@upflow.me>
 *
 */

function afterProcessCreate(processId) {
    log.info('### uf-log | Início afterProcessCreate(processId: '+processId+') ###');

	// salva o número da solicitação no campo do formulário
	hAPI.setCardValue("PROTOCOLO", processId);
    
    // salva a data no campo do formulário
    var dtaHra = dataFormatada();
	hAPI.setCardValue('SOLICDATA', dtaHra);
	
    log.info('### uf-log | Final afterProcessCreate(processId: '+processId+') ###');
}

/**
 * @desc 	Retorna a Data e Hora atual no formato: DD/MM/AAAA hh:mm:ss 
 */
function dataFormatada() {
    var data = new Date(),
        dia = data.getDate(),
        mes = data.getMonth() + 1,
        ano = data.getFullYear(),
        hora = data.getHours(),
        minutos = data.getMinutes(),
        segundos = data.getSeconds();
    
    var dtaHra = '';
    dtaHra += [Number(dia).pad(), Number(mes).pad(), Number(ano).pad()].join('/');
    dtaHra += ' ';
    dtaHra += [Number(hora).pad(), Number(minutos).pad(), Number(segundos).pad()].join(':');
    
    return dtaHra;
}

/**
 * @desc 	Formata um número colocando @size zeros à esquerda  
 */
Number.prototype.pad = function (size) {
    var s = String(this);
    while (s.length < (size || 2)) {
        s = "0" + s;
    }
    return s;
}
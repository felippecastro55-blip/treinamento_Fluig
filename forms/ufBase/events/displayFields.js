/**
 *
 * @desc        Script padrão do Fluig para exibição do formulário (displayFields.js)
 *              Esse evento é disparado no momento em que os objetos do formulário são apresentados.
 * @copyright   2018 upFlow.me
 * @version     1.0.0
 * @author      Helbert Campos <helbert@upflow.me>
 *
 */

function displayFields(form, customHTML) {

    // cria objeto com os parâmetros do workflow e envia para o html
    var scp = "var infoWorkflow = {";
        scp += "WKDef:'"+getValue('WKDef')+"',";                    // Código do processo.
        scp += "WKVersDef:'"+getValue('WKVersDef')+"',";            // Versão do processo.        
        scp += "WKNumProces:'"+getValue('WKNumProces')+"',";        // Número da solicitação de processo.            
        scp += "WKNumState:'"+getValue('WKNumState')+"',";          // Número da atividade movimentada.        
        scp += "WKCurrentState:'"+getValue('WKCurrentState')+"',";  // Número da atividade atual.                
        scp += "WKCompany:'"+getValue('WKCompany')+"',";            // Número da empresa.        
        scp += "WKUser:'"+getValue('WKUser')+"',";                  // Código do usuário corrente.
        scp += "WKCompletTask:'"+getValue('WKCompletTask')+"',";    // Se a tarefa foi completada (true/false).                
        scp += "WKNextState:'"+getValue('WKNextState')+"',";        // Número da próxima atividade (destino).            
        scp += "WKCardId:'"+getValue('WKCardId')+"',";              // Código do formulário do processo.    
        scp += "WKFormId:'"+getValue('WKFormId')+"',";              // Código da definição de formulário do processo.    
    scp += "};"
    customHTML.append("<script type='text/javascript'>"+scp+"</script>");

    // envia a variável (string) para o HTML com o modo de edição do formulário
	customHTML.append("<script type='text/javascript'>var modForm = '"+form.getFormMode()+"';</script>");

    log.info('### uf-log | Início displayFields(WKNumProces: '+getValue('WKNumProces')+', WKNumState: '+getValue('WKNumState')+', modForm: '+form.getFormMode()+', WKUser: '+getValue('WKUser')+') ###');
   
    // resgata informações do usuário logado
    filter = new java.util.HashMap();
    filter.put('colleaguePK.colleagueId', getValue('WKUser'));
    var usuario = getDatasetValues('colleague', filter);    // variável com dados do usuário logado
    
    var userActive = "var infoUserActive = {";
    userActive += "code:'"+usuario.get(0).get('colleaguePK.colleagueId')+"',";                    // Código do processo.
    userActive += "name:'"+usuario.get(0).get('colleagueName')+"',";            // Versão do processo.        
    userActive += "mail:'"+usuario.get(0).get('mail')+"',";        // Número da solicitação de processo.               
    userActive += "};"
    	customHTML.append("<script type='text/javascript'>"+userActive+"</script>");
    
    // leva as informações do status para o front-end
    var statusAtivAtual = lstAtiv[1];
    if (form.getFormMode() != 'ADD') statusAtivAtual = lstAtiv[getValue('WKNumState')];
    // Caso a solicitação for cancelada, manda para a atv de cancelado
    if(form.getValue("STATUSCOD") == '0') {
        statusAtivAtual = lstAtiv[0];
    } 

    customHTML.append("<script type='text/javascript'>var ufStatus = "+JSON.stringify(statusAtivAtual)+";</script>");
    
    var isMobile = form.getMobile()
    customHTML.append("<script type='text/javascript'>var isMobile = " + isMobile + ";</script>");

    log.info('### uf-log | Final displayFields(WKNumProces: '+getValue('WKNumProces')+', WKNumState: '+getValue('WKNumState')+', modForm: '+form.getFormMode()+', WKUser: '+getValue('WKUser')+') ###');
}
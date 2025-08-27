/**
 *
 * @desc        Lista de atividades/status do workflow
 * @copyright   2018 upFlow.me
 * @version     1.0.0
 * @author      Helbert Campos <helbert@upflow.me>
 *
 */

/** Lista de atividades/status utilizados pela framework para preencher o campo status do formulário
 * 
 * numeral ==> código da atividade
 * 
 * tit ==> título
 * des ==> descrição
 * cbk ==> cor do background
 * cfn ==> cor da fonte
 * ico ==> ícone do fluig style guide
 * 
 * Observação Importante:
 * A Atividade que inicia o workflow tem sempre dois códigos, e ambos devem ser informados na lista
 *      Código '0' - Código reservado pelo Fluig, para a atividade inicial.
 *      Código 'X' - Código atribuido ao criar a atividade no diagrama/workflow.
 *  
 * */

lstAtiv = {
    0: {
        tit: 'Cancelado',
        des: 'Atividade foi cancelada e não poderá ser reaberta.',
        cbk: '#B71C1C',
        cfn: '#FFEBEE',
        ico: '<span class="fluigicon fluigicon-remove-circle"></span>',
    },
    4: {
        tit: 'Início',
        des: 'Atividade está em preenchimento de formulário.',
        cbk: '#757575',
        cfn: '#F5F5F5',
        ico: '<span class="fluigicon fluigicon-add-test"></span>',
    },
    5: {
        tit: 'Aprovação de Férias',
        des: 'Atividade em aprovação do RH.',
        cbk: '##2E7D32',
        cfn: '#E8F5E9',
        ico: '<span class="fluigicon fluigicon-test-refresh"></span>',
    },
    7: {
        tit: 'Ajuste Solic Férias',
        des: 'Solicitação foi encerrada com sucesso.',
        cbk: '#2E7D32',
        cfn: '#E8F5E9',
        ico: '<span class="fluigicon fluigicon-check-circle-on"></span>',
    },
    8: {
        tit: 'Solicitação cancelada',
        des: 'Solicitação finalizada.',
        cbk: '#B71C1C',
        cfn: '#FFEBEE',
        ico: '<span class="fluigicon fluigicon-check-circle-on"></span>',
    },
}
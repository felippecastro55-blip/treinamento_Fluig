var UF_CodeEditor = SuperWidget.extend({
    
    widgetId: null,
    
    //método iniciado quando a widget é carregada
    init: function() {
        console.info('INÍCIO | Script da widget:', this.instanceId, 'repositório:', this.reposi, 'versao:', this.versao, 'widgetId:', this.widgetId, 'preferences:', this.preferences);
    	$('span#ufrepname').html(this.reposi); $('span#ufrepversion').html(this.versao);
    	
    	const DATASOURCE = this.preferences.DATASOURCE?this.preferences.DATASOURCE:'jdbc/FluigDSRO';

    	CodeEditor.init(); 
    	bind(DATASOURCE);
    },
  
    //BIND de eventos
    bindings: {
        local: {
            'save-preferences': ['click_savePreferences']
        },
        global: {}
    },
    
    savePreferences: function () {
        var preferences = {
        		DATASOURCE: new String($('input[name="DATASOURCE"]').val())
        };
        WCMSpaceAPI.PageService.UPDATEPREFERENCES(
            {
                async: true,
                success: function (data) {
                    FLUIGC.toast({ title: data.message, message: '', type: 'success' });
                },
                fail: function (xhr, message, errorData) {
                    console.error('fail', xhr, message, errorData);
                    FLUIGC.toast({ title: '', message: message, type: 'error' });
                }
            }, this.widgetId, preferences
        );
	},
    
});



const bind = function(DATASOURCE){
	$('#enviar').on('click', function(){
		CodeEditor.sendRequest(DATASOURCE);
	})
	
	$(document).on('keydown', function(evt){
		if(evt.keyCode === 121){
			CodeEditor.sendRequest(DATASOURCE);
		}else if(evt.keyCode === 118){
			if($('#block').hasClass('block')){
				$('#block').removeClass('block')
			}else{
				$('#block').addClass('block')
			}
			
		}
	})
}

var CodeEditor = {
		editor: null,
		dt: null,
		init: function(){
			var codeEditor = document.getElementById('codeEditor')
			this.editor = CodeMirror.fromTextArea(codeEditor, {
			    lineNumbers: true,
			    mode: "sql",
			    theme: "material-darker"
			 });
		},
		sendRequest: function(DATASOURCE){
			var self = this;
			
			//verifica se tem algo selecionado
			var selecao = window.getSelection().toString()
			
			let parametros = ['1', DATASOURCE, JSON.stringify({QUERY: selecao||this.editor.getValue()})];
			
			var loading = FLUIGC.loading(window, {textMessage: 'Carregando Dados...'});
			loading.show();

			uFAPI.sendRequest(parametros, function(error, msg, detalhes, resultado){
				if(error == 0){
					console.log(resultado)
					self.createTable(self.trataRetorno(resultado))
					loading.hide();
				}else{
					console.error(msg)
					self.createTable
					(
							{
								columns: ['ERROR', 'MSG', 'DETALHES'],
								values: [{
									ERROR: error,
									MSG: msg,
									DETALHES: detalhes
								}]
							}	
					)
					loading.hide();
				}
			})
		},
		
		trataRetorno: function(data){
			if(data.values.length === 0){
				
			return	{
					columns: [''],
					values: []
				}
			}
			
			return data;
			
		},
		createTable: function(data){
			
		
			let columns = data.columns.map(item => (
					{
						title: item, 
						data: item, 
						width: '1%',
						className: 'text-nowrap'
					}
				))
			
			
				if ( $.fn.DataTable.isDataTable('#containerTableResult table#tableResult') ) {
				  $('#containerTableResult table#tableResult').DataTable().destroy();
				  $('table#tableResult thead').empty();
				  $('table#tableResult tbody').empty();
				}
				
				this.dt = $(`#containerTableResult table#tableResult`).DataTable( {
			        data: data.values,
			        pageLength: 15,
					language: {
						thousands: ".",
						zeroRecords: "<i class='fa fa-exclamation-circle' aria-hidden='true'></i> Nenhum item localizado",
						emptyTable: "<i class='fa fa-exclamation-circle' aria-hidden='true'></i> Nenhum item localizado",
						info: "Exibindo _TOTAL_ itens",
						infoEmpty: "Nenhum item localizado",
						infoFiltered: "(filtro de um total de _MAX_ itens)",
						paginate: {
							first: "Primeira",
							previous: "Anterior",
							next: "Próxima",
							last: "Última"
						},
						aria: {
							sortAscending: "Classificar na ordem crescente",
							sortDescending: "Classificar na ordem decrescente"
						},
						buttons: {
							copyTitle: 'Copiado para Área de Transferência',
							copyKeys: 'Pressione <i>Ctrl</i> ou <i>\u2318</i> + <i>C</i> para copiar os dados da tabela para a Área de Transferência.</br>Para cancelar, clique sobre esta mensagem ou pressione a tecla Esc.',
							copySuccess: {
								_: '%d linhas copiadas',
								1: '1 linha copiada'
							}
						},
					},
					ordering: false,
					scrollX: true,
			        searching: false,
			        lengthChange: false,
			        columns: columns,
			      
		    })
		
	}
}


var uFAPI = {
		sendRequest: function(PARAM, funcResposta){
			//Envia a query para o dataset;
			
	        try {
	            DatasetFactory.getDataset('codeEditor_DBFluigConsulta', PARAM, null, null, {
	                success: function (content) {
	                    // verifica se o DataSet retornou um erro
	                    if ( content.values.length == 1 && content.columns.includes('ERRO') && content.values[0].ERRO != '0' ) { // se há apenas uma linha e a coluna chama-se ERRO
	                        console.error('RESPOSTA vcXMLRPC com erro', 'O DataSet foi consultado, mas retornou um erro:', content.values[0]);
	                        funcResposta(1, 'Chamada realizadas mas o servidor retornou um erro!', content.values[0].DETALHES, null); // erro, msg, detalhes, resultado
	                    } else {    // se não há a coluna ERRO
	                        //console.info('RESPOSTA vcXMLRPC com sucesso', content);
	                        funcResposta(0, 'O servidor retornou ' + content.values.length + ' registros.', null, content); // erro, msg, detalhes, resultado
	                    }
	                },
	                error: function (jqXHR, textStatus, errorThrown) {
	                    console.error('RESPOSTA vcXMLRPC com erro', jqXHR, textStatus, errorThrown);
	                    funcResposta(1, 'Chamada realizadas mas o servidor retornou um erro!', errorThrown, null); // erro, msg, detalhes, resultado
	                },
	            });

	        } catch (e) {
	            console.error('Erro na consulta ao DataSet:', e);
	            funcResposta(1, 'Chamada realizadas mas o servidor retornou um erro!', e, null); // erro, msg, detalhes, resultado
	        }
		}
}
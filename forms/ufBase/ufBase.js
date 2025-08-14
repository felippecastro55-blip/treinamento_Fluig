
// variáreis declaradas no evento displayFields.js do Formulário verifica se elas existem, se não, define valores padrão
if (typeof infoWorkflow == 'undefined') infoWorkflow = {};       // objeto com informações do workflow
if (typeof modForm == 'undefined') modForm = 'ADD';    // modo do formulário

$(document).ready(function () {
	WKNumState = ((typeof infoWorkflow.WKNumState != 'undefined') ? Number(infoWorkflow.WKNumState) : 0);

	/**	Lista contendo objetos de configurações de campo
	 * as configurações são executadas em acordo com o estado do processo.
	 * type: 'MOD', 'VIEW', 'ADD' e 'default' - modo de exibição do processo.
	 * num: 'x' - codigo da atividade
	 */
	var fieldsConfig = [
		{
			state: { type: 'default', num: [2] },
			fieldType: 'aprovacao', //TIPO DE CAMPO APROVACAO
			name: 'TESTE', //STRING CHAVE PARA INICIAR APROVACAO
		},
		{
			name: 'DATAEXEMPLO', //NOME DO CAMPO
			state: { type: 'default', num: [0, 1] }, //type: LISTA DE ESTADO DO FORMULARIO (EX: ['VIEW']). DEFAULT = [MOD, ADD] || NUM = LISTA DE ATIVIDADES QUE TAL CONFIGURAÇÃO VAI AGIR. (EX: [1, 2]). "all" = TODAS 
			fieldType: 'date', //TIPO DE CAMPO DATA
			validate: ['required'],
			fieldOptions: {
				maxDate: moment(),
				useCurrent: false
			},
			customActions: function ($self) { //função para customização

				$self.parent().find('.iconData').on('click', function () {

					$self.trigger('click').focus();

				})

			}
		},
		{
			state: { type: 'default', num: [0, 1] }, //type: LISTA DE ESTADO DO FORMULARIO (EX: ['VIEW']). DEFAULT = [MOD, ADD] || NUM = LISTA DE ATIVIDADES QUE TAL CONFIGURAÇÃO VAI AGIR. (EX: [1, 2]). "all" = TODAS 
			name: 'MONETARIOEXEMPLO', //NOME DO CAMPO
			class: ['text-right'],
			fieldType: 'money', //TIPO DE CAMPO monetario
			validate: ['required'],
			fieldOptions: {
				prefix: 'R$ ',
				thousands: '.',
				decimal: ','
			},
		},
		{
			state: { type: 'default', num: [0, 1] },
			fieldType: 'zoom', //TIPO DE CAMPO APROVACAO
			name: 'USUARIO', //STRING CHAVE PARA INICIAR APROVACAO
			validate: ['required'],
			zoomOptions: {
				label: 'Usuários',
				uFZommType: '3',	// 1=DataServer | 2=Consulta | 3=Dataset | 4=query 
				clear: [{
					name: 'USUARIO',
				},
				{
					name: 'USUARIOCOD',
				}],
				CodQuery: 'colleague', // dataserver | codsentenca | nome_dataset | array
				constraints: [],
				// Fields que serão inseridos no dataset para o uFZommType: '3'
				dsFields: ['colleagueName', 'login', 'mail'],
				columns: [
					{ title: 'Matricula', data: 'login', className: 'text-nowrap' },
					{ title: 'Nome', data: 'colleagueName' },
					{ title: 'Email', data: 'mail'},
				],
			},
			zoomReturn: {
				//DEFAULT = RETORNO DO DATASET DIRETO PARA CAMPOS DO FORM
				//1 = UTILIZA 'DE PARA' do fields
				//2 = UTILIZA 'FUNÇÃO' do fields
				type: '1',
				fields: [
					{
						data: 'colleagueName',
						formField: 'USUARIO'
					},
					{
						data: 'login',
						formField: 'USUARIOCOD'
					},
				]

			}
		},
		{
			state: { type: 'default', num: [0, 1] },
			fieldType: 'zoom', //TIPO DE CAMPO APROVACAO
			name: 'PROCESSO', //STRING CHAVE PARA INICIAR APROVACAO
			validate: ['required'],
			zoomOptions: {
				tooltip: false,
				label: 'processos',
				serverSide:{
					searchWithValue: async function({value}){
						const processId = "FLUIGADHOC"
						const url = `/process-management/api/v2/processes/${processId}/requests/tasks?
													&expand=deadlineSpecification
													&order=deadline
													&processInstanceId=${value}`
						let response = await fetch(url)
						response = await response.json()
						return {
							dados: response.items,
							total: this.total
						}
					},
					objSearch: async function({start,pageSize,page}){
						const processId = "FLUIGADHOC"
						if(!this.total){
							const url = `/process-management/api/v2/processes/${processId}/requests/tasks/resume`
							let response = await fetch(url)
							response = await response.json()
							this.total = response.total
						}
						const url = `/process-management/api/v2/processes/${processId}/requests/tasks?
							&expand=deadlineSpecification
							&pageSize=${pageSize}
							&page=${page}
							&order=deadline`
						let response = await fetch(url)
						response = await response.json()
						return {
							dados: response.items,
							total: this.total
						}
					},
					total: 0
				},
				// Fields que serão inseridos no dataset para o uFZommType: '3'
				columns: [
					{ title: 'Protocolo', data: 'processInstanceId', className: 'text-nowrap' },
					{ title: 'Descrição', data: 'processDescription' },
					{ title: 'Sequence', data: 'movementSequence' },
				],
			},
			zoomReturn: {
				//DEFAULT = RETORNO DO DATASET DIRETO PARA CAMPOS DO FORM
				//1 = UTILIZA 'DE PARA' do fields
				//2 = UTILIZA 'FUNÇÃO' do fields
				type: '1',
				fields: [
					{
						data: 'processInstanceId',
						formField: 'PROCESSOCOD'
					},
					{
						data: 'processDescription',
						formField: 'PROCESSO'
					},
				]

			}
		},
		{
			name: 'CEPEXEMPLO', //NOME DO CAMPO
			state: { type: 'default', num: [0, 1] }, //type: LISTA DE ESTADO DO FORMULARIO (EX: ['VIEW']). DEFAULT = [MOD, ADD] || NUM = LISTA DE ATIVIDADES QUE TAL CONFIGURAÇÃO VAI AGIR. (EX: [1, 2]). "all" = TODAS 

			fieldType: 'cep', //TIPO DE CAMPO cep
			validate: ['required']
		},
		{
			name: 'INFOADICIONAIS', //NOME DO CAMPO
			state: { type: 'default', num: [0, 1] }, //type: LISTA DE ESTADO DO FORMULARIO (EX: ['VIEW']). DEFAULT = [MOD, ADD] || NUM = LISTA DE ATIVIDADES QUE TAL CONFIGURAÇÃO VAI AGIR. (EX: [1, 2]). "all" = TODAS 
			validate: ['required','tamanhoMaiorQue30']
		}
	];

	//Lista contendo objeto de sections
	var sectionsConfig = [
		{
			id: 'secCabecalho',
			visible: true, //TRUE = SEMPRE VISIVEL || FALSE = VISIVEL APENAS NAS ATIVIDADES CONTIDAS EM VISIBLEATV
			visibleAtv: [], //LISTA DE ATIVIDADES QUE ESSA SECTION É VISIVEL. 
			enabled: false, //TRUE = TAL SECTION É ENABLED EM ALGUMA ATIVIDADE || FALSE = SEMPRE DISABLED
			enabledAtv: [] //LISTA DE ATIVIDADES QUE ESSA SECTION NÃO ESTÁ DISABLED. "all" HABILITA TODAS AS ATIVIDADES
		},
		{
			id: 'secSolicitante',
			visible: true, //TRUE = SEMPRE VISIVEL || FALSE = VISIVEL APENAS NAS ATIVIDADES CONTIDAS EM VISIBLEATV
			visibleAtv: [], //LISTA DE ATIVIDADES QUE ESSA SECTION É VISIVEL. 
			enabled: false, //TRUE = TAL SECTION É ENABLED EM ALGUMA ATIVIDADE || FALSE = SEMPRE DISABLED
			enabledAtv: [] //LISTA DE ATIVIDADES QUE ESSA SECTION NÃO ESTÁ DISABLED. "all" HABILITA TODAS AS ATIVIDADES
		},
		{
			id: 'secRequisicao',
			visible: false, //TRUE = SEMPRE VISIVEL || FALSE = VISIVEL APENAS NAS ATIVIDADES CONTIDAS EM VISIBLEATV
			visibleAtv: [0, 1, 2, 4, 6], //LISTA DE ATIVIDADES QUE ESSA SECTION É VISIVEL. 
			enabled: true, //TRUE = TAL SECTION É ENABLED EM ALGUMA ATIVIDADE || FALSE = SEMPRE DISABLED
			enabledAtv: [0, 1] //LISTA DE ATIVIDADES QUE ESSA SECTION NÃO ESTÁ DISABLED. "all" HABILITA TODAS AS ATIVIDADES
		},
		{
			id: 'secAprovacaoTESTE',
			visible: false, //TRUE = SEMPRE VISIVEL || FALSE = VISIVEL APENAS NAS ATIVIDADES CONTIDAS EM VISIBLEATV
			visibleAtv: [2, 4, 6], //LISTA DE ATIVIDADES QUE ESSA SECTION É VISIVEL
			enabled: true, //TRUE = TAL SECTION É ENABLED EM ALGUMA ATIVIDADE || FALSE = SEMPRE DISABLED
			enabledAtv: [0, 1, 2] //LISTA DE ATIVIDADES QUE ESSA SECTION NÃO ESTÁ DISABLED
		},
		{
			id: 'secDependentes',
			visible: false, //TRUE = SEMPRE VISIVEL || FALSE = VISIVEL APENAS NAS ATIVIDADES CONTIDAS EM VISIBLEATV
			visibleAtv: [0, 1, 2, 4, 6], //LISTA DE ATIVIDADES QUE ESSA SECTION É VISIVEL
			enabled: true, //TRUE = TAL SECTION É ENABLED EM ALGUMA ATIVIDADE || FALSE = SEMPRE DISABLED
			enabledAtv: [0, 1] //LISTA DE ATIVIDADES QUE ESSA SECTION NÃO ESTÁ DISABLED
		},
		{
			id: 'secCEP',
			visible: false, //TRUE = SEMPRE VISIVEL || FALSE = VISIVEL APENAS NAS ATIVIDADES CONTIDAS EM VISIBLEATV
			visibleAtv: [0, 1, 2, 4, 6], //LISTA DE ATIVIDADES QUE ESSA SECTION É VISIVEL
			enabled: true, //TRUE = TAL SECTION É ENABLED EM ALGUMA ATIVIDADE || FALSE = SEMPRE DISABLED
			enabledAtv: [0, 1] //LISTA DE ATIVIDADES QUE ESSA SECTION NÃO ESTÁ DISABLED
		}

	];

	/** Lista contendo objeto de tables
	 * Utilizado para configurar campos das tabelas.
	 */
	var tablesConfig = [
		{
            state: { type: "default", num: ["all"] },
            id: "tblPaiFilho",
            fields: [
                {
                    state: { type: "default", num: ["all"] },
                    fieldType: "zoom", //TIPO DE CAMPO APROVACAO
                    name: "ZOOMCOMP", //STRING CHAVE PARA INICIAR APROVACAO
                    validate: ["required"],
                    zoomOptions: {
                        label: "Ações",
                        uFZommType: "5", // 1=DataServer | 2=Consulta | 3=Dataset | 4=query  | 5=array
                        clear: [
                            {
                                name: "ZOOMCOMP",
                            },
                            {
                                name: "ACAOCOD",
                            },
                        ],
                        CodQuery: [// dataserver | codsentenca | nome_dataset | array
							{
								'ACTIONCOD': '0',
								'ACTION': 'Enviar email'
							},
							{
								'ACTIONCOD': '1',
								'ACTION': 'Enviar email e acompanhar resposta'
							},
						], 
                        constraints: [],
                        // Fields que serão inseridos no dataset para o uFZommType: '3'
                        dsFields: ["ACTIONCOD","ACTION"],
                        columns: [
                            { title: "Código", data: "ACTIONCOD" },
                            { title: "Ação", data: "ACTION" },
                        ],
                    },
                    zoomReturn: {
                        //DEFAULT = RETORNO DO DATASET DIRETO PARA CAMPOS DO FORM
                        //1 = UTILIZA 'DE PARA' do fields
                        //2 = UTILIZA 'FUNÇÃO' do fields
                        type: "1",
                        fields: [
                            {
                                data: "ACTIONCOD",
                                formField: "ACAOCOD",
                            },
                            {
                                data: "ACTION",
                                formField: "ZOOMCOMP",
                            },
                        ],
                    },
                },
                {
                    name: "DATACOMP", //NOME DO CAMPO
                    state: { type: "default", num: [0, 9, 13] }, //type: LISTA DE ESTADO DO FORMULARIO (EX: ['VIEW']). DEFAULT = [MOD, ADD] || NUM = LISTA DE ATIVIDADES QUE TAL CONFIGURAÇÃO VAI AGIR. (EX: [1, 2]). "all" = TODAS
                    fieldType: "date", //TIPO DE CAMPO DATA
                    validate: ['required'],
                    fieldOptions: {
                        minDate: moment(),
                        useCurrent: false,
                    },
                    customActions: function ($self) {
                        //função para customização
                        $self.parent().find('.iconData').on('click', function () {

                            $self.trigger('click').focus();
        
                        });
                    },
                },
            ],
            // Função que executa antes de deletar um ITEM da tabela.
            beforeRemoveCallback: function ($self) {
                console.info("Rodou antes de excluir a linha: ", $self);
            },
            // Função que executa após deletar um ITEM da tabela  OBS: Não retorna o $self pois a linha já foi excluida.
            afterRemoveCallback: function () {
                console.info("Rodou após excluir a linha.");
            },
            // Função que executa após adicionar um ITEM da tabela.
            afterAddLine: function ($self) {
                console.info("Rodou após adicionar uma linha.");
            },
        },
	];

	/** Configurações das customActions
	 * customActions executam javascript, em acordo com o estado do processo:
	 * 		type: 'VIEW', 'MOD' e 'ADD' - modos de exibição do processo.
	 * 		num: 'all', '<codigo da atividade>' - código das atividades.
	 */
	var customActionsConfig = [
		{
			state: { type: ['VIEW'], num: 'all' },
			customActions: function () {
				var secNome = ['secAprovacaoTESTE']
				var arrayWKNumstate = [2]
	
				if (modForm == 'VIEW') { // No modo view esconde as seções de aprovações necessárias
					arrayWKNumstate.forEach(function (item, i) {
						if (item == WKNumState) {
							$('#' + secNome[i]).hide()
						}
					})
				};

				console.log('Executou customActions')
			}
		},
		{
            state: { type: "default", num: [0, 1, 3] },
            customActions: function () {
                $("#BTNANEXOCOTACAO").on("click", function () {
                    JSInterface.showCamera("Cotacao"); // anexando
                    parent.$("#attachmentsStatusTab").trigger("click");
                });
            },
        },
	];

	//função para determinar qual será a configuração padrao do validate dentro do framework
	uFFw.setDefaults('validOptions', { depends: function (el) { return true }, })

	//inicia o framework
	uFFw.init(modForm, WKNumState, fieldsConfig, sectionsConfig, tablesConfig, customActionsConfig);
	if(modForm != 'VIEW') setTimeout(() => {$validator.form();}, 300)

});


/**
* Função padrão do Fluig. É executada quando o usuário pressiona o botão Movimentar
* antes de serem exibidas as opções de movimentação do processo.
* ## Se o fluxo não necessitar da interação do usuário, este método não será executado!  
* return false: impedirá a execução do processo. Esta opção permite que sejam exibidos erros personalizados no formulário.
* throw(“Erro”): impedirá a execução e exibirá uma tela de erro padrão do fluig com o texto informado.
* @param numState - número da atividade atual
*/
var beforeMovementOptions = function (numState) {
	console.info('VALIDAÇÃO', 'Atividade:', numState);

	if (!$validator.form()) throw 'Não será possível enviar os dados pois há campos com erro.</br>Por favor, verifique os campos destacados de vermelho.</br>' + uFFw.utils.listaErros();

};

/**
 * Função padrão do Fluig. Ocorre antes da solicitação ser movimentada, após já ter sido
 * selecionada a atividade destino, o usuário e demais informações necessárias à solicitação.
 * @param numState - número da atividade atual
 * @param nextState - número da atividade destino
 */
var beforeSendValidate = function (numState, nextState) {
	console.info('CONFIRMAÇÃO', 'De:', numState, 'Para:', nextState);

	// verifica a validação do formulário
	if (!$validator.form()) {

		parent.FLUIGC.message.alert({
			message: 'Não será possível enviar os dados pois há campos com erro.</br>Por favor, verifique os campos destacados de vermelho.</br>' + uFFw.utils.listaErros(),
			title: 'Formulário não validado',
			label: 'OK'
		});

		return false;
	}

	return true

};

/**Validações Customizadas
 * Utilizado no fieldsConfig para executar validações nos campos do formulário.
 * deve-se incluir <nome da validação> no campo validate de fieldsConfig
 */

/**
 * Função para validação do campo textarea
 * retorna true se o campo tem pelo menos 30 caracteres
 * retorna false cc.
 */
 $.validator.addMethod(
    "tamanhoMaiorQue30",
    function (value, element) {
        return value.length >= 30
    },
    "Por favor, forneça ao menos 30 caracteres."
);
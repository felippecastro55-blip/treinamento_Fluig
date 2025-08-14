
window.listaCalendar = [];

var uFFw = {

	setDefaults: function (typeConfig, config) {

		uFFw.defaults[typeConfig] = config

	},

	globalFunctions: {

		init: function (modForm) {


			// atualiza a cor dos elementos com a mesma cor do menu do Fluig
			if (typeof parent.WCMAPI != 'undefined') {
				if (parent.WCMAPI.colorMenu != '') {
					$('.uf-colormenu').css('color', parent.WCMAPI.colorMenu);
				} else {
					$('.uf-colormenu').css('color', parent.$('.profile-pencil').css('color'));
				}
			}



			// dispara quando altera qualquer campo do formulário
			window.$validator = $('form').validate();
			$validator.form();
			// $('form').on('change', function () {
			//     // efetua a validação total do formulário
			//     $validator.form();

			// });

			if (modForm == 'ADD') {

				$('input[name="SOLICDATA"]').val(moment().format('DD/MM/YYYY'));
				$('input[name="SOLICCOD"]').val(infoUserActive.code);
				$('input[name="SOLICNOME"]').val(infoUserActive.name);
				$('input[name="SOLICEMAIL"]').val(infoUserActive.mail);
				$('input[name="SOLICLOGIN"]').val(infoUserActive.login);

			} else if (modForm == 'GED') {

				console.log('Executando configuração de exibição do GED')

				$('section').setDisabled();
				$('.iconData').hide();
				$('button').hide();

			}

		}

	},

	//objeto de configuração padrão para funcionamento de rotinas
	defaults: {

		zoomBetaConstraints: null,
		zoomBetaFields: null,
		dateOptions: { useCurrent: false },
		validOptions: { depends: function (el) { return $(el).is(":visible"); }, },
		moneyOptions: { prefix: '', thousands: '', decimal: ',' },
		zoomReturn: function (cmp, info, fields = null, sufix) {

			var sufix = sufix == null ? '' : sufix;
			var nameField = field.formField + sufix

			for (var key in info) {
				$('[name="' + nameField + + '"]').val(info[key]).trigger('change');
			}

			$('form').trigger('change');

		},
		zoomFields: function (cmp, info, fields, sufix) {

			fields.forEach(function (item) {

				var fieldSufix = sufix == null ? '' : sufix;

				var nameField = item.formField + fieldSufix

				$('[name="' + nameField + '"]').val(info[item.data]).trigger('change')

			})



		}


	},

	//Inicia procedimento do framework
	//Parametros: numero da Atividade, configuração de campos, configuração de seções
	init: function (modForm, numState, fieldsConfig, sectionsConfig, tablesConfig, customActionsConfig) {

		this.globalFunctions.init(modForm);
		this.status.init();
		this.fields.init(modForm, numState, fieldsConfig);
		this.sections.init(numState, sectionsConfig);
		this.tables.init(numState, tablesConfig);
		this.customActions.init(modForm, numState, customActionsConfig);


		setTimeout(function () { $('form').trigger('change') }, 100);
	},

	customActions: {

		init: function (modForm, numState, customActionsConfig) {


			customActionsConfig.forEach(function (customActionConfig) {

				if (typeof customActionConfig.state.type == 'undefined' || customActionConfig.state.type == 'default' || customActionConfig.state.type == null) {

					if (modForm == 'ADD' || modForm == 'MOD') {


						if (typeof customActionConfig.state.num != 'undefined') {


							if (uFFw.utils.verificaConteudo(numState, customActionConfig.state.num)) {

								uFFw.customActions.start(customActionConfig.customActions);

							}

						}

					}

				} else {

					if (uFFw.utils.verificaConteudo(modForm, customActionConfig.state.type)) {

						if (modForm == 'GED' || typeof customActionConfig.state.num != 'undefined') {

							if (modForm == 'GED' || uFFw.utils.verificaConteudo(numState, customActionConfig.state.num)) {

								uFFw.customActions.start(customActionConfig.customActions);

							}

						}

					}

				}


			})

		},

		start: function (customAction) {

			customAction();


		}

	},

	tables: {

		initEvents: function (tableConfig) {


			$('[uf-addChild="' + tableConfig.id + '"]').on('click', function () {

				var linhaIdx = wdkAddChild(tableConfig.id);
				$('[name="' + tableConfig.id + 'ID___' + linhaIdx + '"]').val(linhaIdx);
				tableConfig.fields.forEach(function (fieldConfig) {


					var prefix = fieldConfig.name.split('___')[0];
					var sufix = '___' + linhaIdx;

					fieldConfig.name = prefix + sufix;

					if (fieldConfig.fieldType == "zoomFluig") {
						$("[name=" + fieldConfig.name + "]").attr('type', 'zoom')
						uFFw.fields.zoomFluig.init(fieldConfig, sufix);
						window.loadZoom(fieldConfig.name)
					}

					$('[name="' + fieldConfig.name + '"]').parents('tr').find('[uf-removeChild="' + tableConfig.id + '"]').off().on('click', function () {

						var element = this;

						// exibe a mensagem de confirmação para o usuário
						parent.FLUIGC.message.confirm({
							message: 'Você realmente deseja remover o item da tabela?',
							title: 'Remover linha da tabela',
							labelYes: 'Remover',
							labelNo: 'Cancelar'
						}, function (result, el, ev) {

							// se respondeu para remover a linha
							if (result) {

								if (typeof tableConfig.beforeRemoveCallback != 'undefined') {
									// roda antes de excluir o item
									tableConfig.beforeRemoveCallback($(element));
								};

								fnWdkRemoveChild(element);

								if (typeof tableConfig.afterRemoveCallback != 'undefined') {
									// roda depois de excluir o item OBS: Não tem $self pois a linha foi excluida.
									tableConfig.afterRemoveCallback();
								};
							}

						});
					})


					uFFw.fields.start(fieldConfig, sufix);

				})
				if (typeof tableConfig.afterAddLine != 'undefined') {

					tableConfig.afterAddLine($('[tablename="' + tableConfig.id + '"] tr:last'));
				}
				$validator.form();

			})


		},

		init: function (numState, tablesConfig) {

			tablesConfig.forEach(function (tableConfig) {


				if (typeof tableConfig.state.type == 'undefined' || tableConfig.state.type == 'default' || tableConfig.state.type == null) {

					if (modForm == 'ADD' || modForm == 'MOD') {


						if (typeof tableConfig.state.num != 'undefined') {


							if (uFFw.utils.verificaConteudo(numState, tableConfig.state.num)) {

								uFFw.tables.initEvents(tableConfig);

								if (typeof tableConfig.fields != 'undefined') {

									if (tableConfig.fields.length > 0) {


										tableConfig.fields.forEach(function (fieldConfig) {

											uFFw.tables.start(tableConfig, fieldConfig)

										})


									}

								}

							}

						}

					}

				} else {

					if (uFFw.utils.verificaConteudo(modForm, tableConfig.state.type)) {

						if (typeof tableConfig.state.num != 'undefined') {


							if (uFFw.utils.verificaConteudo(numState, tableConfig.state.num)) {

								uFFw.tables.initEvents(tableConfig);

								if (typeof tableConfig.fields != 'undefined') {

									if (tableConfig.fields.length > 0) {


										tableConfig.fields.forEach(function (fieldConfig) {

											uFFw.tables.start(tableConfig, fieldConfig)

										})


									}

								}

							}

						}

					}

				}


			})

		},

		start: function (tableConfig, fieldConfig) {

			$('table[tablename="' + tableConfig.id + '"] tbody > tr:not(:first-child)').each(function (index, linha) {
				$(linha).find('[uf-removeChild="' + tableConfig.id + '"]').off().on('click', function () {

					var element = this;

					// exibe a mensagem de confirmação para o usuário
					parent.FLUIGC.message.confirm({
						message: 'Você realmente deseja remover o item da tabela?',
						title: 'Remover linha da tabela',
						labelYes: 'Remover',
						labelNo: 'Cancelar'
					}, function (result, el, ev) {



						// se respondeu para remover a linha
						if (result) {

							if (typeof tableConfig.beforeRemoveCallback != 'undefined') {
								// roda antes de excluir o item
								tableConfig.beforeRemoveCallback($(element));
							};

							fnWdkRemoveChild(element);

							if (typeof tableConfig.afterRemoveCallback != 'undefined') {
								// roda depois de excluir o item OBS: Não tem $self pois a linha foi excluida.
								tableConfig.afterRemoveCallback();
							};
						}

					});
				});


				var prefix = fieldConfig.name.split('___')[0];
				var sufix = '___' + $(linha).find('[name^="' + prefix + '"]').prop('name').split('___')[1];
				if (sufix == '___undefined') sufix = ''
				var obj = {};


				for (var key in fieldConfig) {
					obj[key] = fieldConfig[key];
				};

				obj.name = prefix + sufix;

				uFFw.fields.start(obj, sufix);

			})



		}

	},

	status: {

		$elBase: $('section#secCabecalho .status-solicitacao'),
		//inicia procedimento de seções
		//parametros: numero da atividade, configuração de seções
		init: function () {

			// inicializa o objeto para visualização
			var options;

			// criando os elementos e inserindo-os no DOM
			if (modForm == "GED") {
				options = {
					class: 'status',
					style: 'color: #F5F5F5;' + 'background-color: #757575;',
					'data-toggle': 'popover',
					'data-title': '<span class="fluigicon fluigicon-add-test"></span>'
						+ ' '
						+ ($('[name="STATUS"]').val()
							? $('[name="STATUS"]').val()
							: $('[name="STATUS"]').html()
								? $('[name="STATUS"]').html()
								: 'GED'),
					'data-content': 'Solicitação acessada pelo GED',
				};
			} else {
				options = {
					class: 'status',
					style: 'color:' + ufStatus.cfn + ';background-color:' + ufStatus.cbk + ';',
					'data-toggle': 'popover',
					'data-title': ufStatus.ico + ' ' + ufStatus.tit,
					'data-content': ufStatus.des,
				};
			}

			this.start(options);

		},

		start: function (options) {

			this.$elBase.append($('<div>', options).html(options['data-title']));
			FLUIGC.popover('[data-toggle="popover"]', { trigger: 'hover', placement: 'auto', viewport: 'html', html: true });

		}


	},

	fields: {

		listSuccessCallBack: {},

		listErrorCallBack: {},

		addCallBack: function (fieldConfig) {
			const { name, successValidation = undefined, errorValidation = undefined } = fieldConfig
			if (successValidation) this.listSuccessCallBack[name] = successValidation
			if (errorValidation) this.listErrorCallBack[name] = errorValidation
		},

		customActions: {

			init: function (fieldConfig) {

				if (typeof fieldConfig.customActions != 'undefined') {

					this.start($('[name="' + fieldConfig.name + '"]'), fieldConfig.customActions);

				}

			},

			start: function ($self, customActions) {

				customActions($self);

			}

		},

		//inicia procedimento de campos
		//parametros: numero da atividade, configuração de campos
		init: function (modForm, numState, fieldsConfig) {
			//verifica se campo tem ação em tal atividade e em tal modo

			fieldsConfig.forEach(function (fieldConfig) {
				if (typeof fieldConfig.state.type == 'undefined' || fieldConfig.state.type == 'default' || fieldConfig.state.type == null) {

					if (modForm == 'ADD' || modForm == 'MOD') {


						if (typeof fieldConfig.state.num != 'undefined') {


							if (uFFw.utils.verificaConteudo(numState, fieldConfig.state.num)) {

								uFFw.fields.start(fieldConfig);
							}

						}

					}

				} else {

					if (uFFw.utils.verificaConteudo(modForm, fieldConfig.state.type)) {

						if (typeof fieldConfig.state.num != 'undefined') {


							if (uFFw.utils.verificaConteudo(numState, fieldConfig.state.num)) {

								uFFw.fields.start(fieldConfig);

							}

						}

					}

				}

			});

		},

		start: function (fieldConfig, sufix = null) {

			//inicia rotina de adição de validação de campos
			uFFw.utils.validate.init(fieldConfig);

			if (fieldConfig.fieldType == 'aprovacao') {

				//inicia rotina de tipo de campo APROVACAO
				uFFw.fields.aprovacao.init(fieldConfig);

			} else if (fieldConfig.fieldType == 'date') {

				//inicia rotina de tipo de campo DATA
				uFFw.fields.date.init(fieldConfig);

			} else if (fieldConfig.fieldType == 'money') {

				//inicia rotina de tipo de campo MONETARIO
				uFFw.fields.money.init(fieldConfig);

			} else if (fieldConfig.fieldType == 'zoom') {

				//inicia rotina de tipo de campo ZOOM
				uFFw.fields.zoom.init(fieldConfig, sufix);

			} else if (fieldConfig.fieldType == 'zoomBeta') {

				//inicia rotina de tipo de campo ZOOM BETA
				uFFw.fields.zoomBeta.init(fieldConfig, sufix);

			} else if (fieldConfig.fieldType == 'zoomFluig') {

				//inicia rotina de tipo de campo ZOOM BETA
				uFFw.fields.zoomFluig.init(fieldConfig, sufix);

			} else if (fieldConfig.fieldType == 'cep') {

				//inicia rotina de tipo de campo cep
				uFFw.fields.cep.init(fieldConfig);

			}

			//inicia rotina de adição de classes
			uFFw.utils.addClass.init(fieldConfig);

			//inicia rotina de adição de funções customizadas
			uFFw.fields.customActions.init(fieldConfig);

			//adiciona callbacks de sucesso e de error para a validação de cada campo
			uFFw.fields.addCallBack(fieldConfig)


		},
		//Objeto de configuração de elementos do tipo ZoomBeta
		zoomBeta: {

			init: function (fieldConfig, sufix) {

				if (typeof fieldConfig.zoomReturn == 'undefined') {

					this.start($('button[uf-zoom^="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, uFFw.defaults.zoomReturn, sufix);

				} else {


					if (typeof fieldConfig.zoomReturn.type == 'undefined' || fieldConfig.zoomReturn.type == 'default') {

						this.start($('[name^="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, uFFw.defaults.zoomReturn, sufix);

					} else {

						if (fieldConfig.zoomReturn.type == '1') {

							this.start($('[name^="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, uFFw.defaults.zoomFields, fieldConfig.zoomReturn.fields, sufix);

						} else {
							this.start($('[name^="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, fieldConfig.zoomReturn.fields);

						}

					}

				}

			},

			start: function ($el, zoomOptions, zoomCallback, listFields, sufix) {
				$el.uFZoomBETA({
					loading: 'Aguarde, consultando cadastro de ' + zoomOptions.label + '...',
					label: zoomOptions.label,
					title: 'Cadastro de ' + zoomOptions.label,
					CodQuery: zoomOptions.CodQuery, //nome_dataset
					fields: zoomOptions.dsFields,
					constraints: zoomOptions.constraints,	// filtros aplicados a consulta
					columns: zoomOptions.columns,
				}, zoomCallback, listFields, sufix);

			},


		},

		zoom: {

			//inicia aprovacao de formulario
			//parametro: objeto de configuração do campo
			init: function (fieldConfig, sufix) {

				if (typeof fieldConfig.zoomReturn == 'undefined') {

					this.start($('button[uf-zoom="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, uFFw.defaults.zoomReturn, sufix);

				} else {


					if (typeof fieldConfig.zoomReturn.type == 'undefined' || fieldConfig.zoomReturn.type == 'default') {

						this.start($('[name="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, uFFw.defaults.zoomReturn, sufix);

					} else {

						if (fieldConfig.zoomReturn.type == '1') {

							this.start($('[name="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, uFFw.defaults.zoomFields, fieldConfig.zoomReturn.fields, sufix);

						} else {
							this.start($('[name="' + fieldConfig.name + '"]:last').parent().find('button[uf-zoom]'), fieldConfig.zoomOptions, fieldConfig.zoomReturn.fields);

						}

					}

				}

			},

			start: function ($el, zoomOptions, zoomCallback, listFields, sufix) {


				$el.uFZoom({
					...zoomOptions,
					loading: 'Aguarde, consultando cadastro de ' + zoomOptions.label + '...',
					title: 'Cadastro de ' + zoomOptions.label,
					fields: zoomOptions.dsFields,
				}, zoomCallback, listFields, sufix);


			},

		},

		//Objeto de configuração de elementos de money
		money: {

			//inicia aprovacao de formulario
			//parametro: objeto de configuração do campo
			init: function (fieldConfig) {

				if (typeof fieldConfig.fieldOptions == 'undefined') {

					this.start($('[name="' + fieldConfig.name + '"]'), uFFw.defaults.moneyOptions);

				} else {

					this.start($('[name="' + fieldConfig.name + '"]'), fieldConfig.fieldOptions);

				}

			},

			start: function ($el, options) {

				$el.maskMoney(options).maskMoney('mask', this.value);

			}

		},

		//Objeto de configuração de elementos de zoom do Fluig
		zoomFluig: {

			//inicia aprovacao de formulario
			//parametro: objeto de configuração do campo
			init: function (fieldConfig) {

				this.start(fieldConfig, fieldConfig.configs);

			},

			start: function (fieldConfig, options) {

				$('[name="' + fieldConfig.name + '"]').fluigZoomConfig(fieldConfig, options)

			},

			add: {},
			remove: {},

		},

		//Objeto de configuração de elementos de data
		date: {

			//inicia aprovacao de formulario
			//parametro: objeto de configuração do campo
			init: function (fieldConfig) {

				if (typeof fieldConfig.fieldOptions == 'undefined') {

					this.start($('[name="' + fieldConfig.name + '"]'), uFFw.defaults.dateOptions);

				} else {

					this.start($('[name="' + fieldConfig.name + '"]'), fieldConfig.fieldOptions);

				}



			},

			start: function ($el, options) {


				var calendario = FLUIGC.calendar($el, options);


				listaCalendar.push({
					cmp: $el,
					calendar: calendario

				})
			}

		},

		//Objeto de configuração de elementos de aprovação
		aprovacao: {

			//inicia aprovacao de formulario
			//parametro: objeto de configuração do campo
			init: function (fieldConfig) {


				var $elBase = $('section#secAprovacao' + fieldConfig.name),
					$cmpAprov = $('section#secAprovacao' + fieldConfig.name + ' input[name="APROVADO' + fieldConfig.name + '"]'),
					$cmpAprovNom = $('section#secAprovacao' + fieldConfig.name + ' input[name="APROVADORNOME' + fieldConfig.name + '"]'),
					$cmpAprovDta = $('section#secAprovacao' + fieldConfig.name + ' input[name="APROVADODATA' + fieldConfig.name + '"]'),
					$cmpAprovCod = $('section#secAprovacao' + fieldConfig.name + ' input[name="APROVADORID' + fieldConfig.name + '"]'),
					$cmpAprovMail = $('section#secAprovacao' + fieldConfig.name + ' input[name="APROVADOREMAIL' + fieldConfig.name + '"]'),
					$cmpObs = $('section#secAprovacao' + fieldConfig.name + ' textarea[name="APROVADOOBS' + fieldConfig.name + '"]'),
					$elAprovMsg = $('section#secAprovacao' + fieldConfig.name + ' .msg-aprov div.alert');


				var exbMsgAprov = function (strSel, ckd) {

					// se está marcando
					if (ckd) {

						// resgata informações do aprovador
						var nm = $cmpAprovNom.val();
						var dt = $cmpAprovDta.val();

						// se não encontrou o campo (modo view), busca o mapa do formulário
						//if (nm == undefined) nm = ufBPM.mapFormulario.getMap().txtAprovadorNome;
						//if (dt == undefined) dt = ufBPM.mapFormulario.getMap().txtAprovacaoData;

						// ao aprovar pelo painel de atendimento, o mapa do formulário não é atualizado
						// sendo assim, não adianta consultar dele no modo view, sempre virá em branco ""
						if (nm == undefined) nm = $('[name="APROVNOME' + fieldConfig.name + '"]').html();
						if (dt == undefined) dt = $('[name="APROVDATA' + fieldConfig.name + '"]').html();

						// remove as classes
						$elAprovMsg.removeClass('alert-success alert-danger');

						// verifica qual valor selecionado
						switch (String(strSel)) {
							case 'S': // aprovado

								// Muda texto do botão de enviar
								$(parent.$('.fixedTopBar').find('button')[0]).html('Enviar');
								$(parent.$('#workflowview-header').find('button')[0]).html('Enviar');

								// mensagem de aprovação
								var msg = '<strong><i class="fa fa-check-circle" aria-hidden="true"></i> APROVADO!</strong> Aprovação realizada por ' + nm + ' em ' + dt;
								$elAprovMsg.removeClass('alert-danger').removeClass('alert-warning').addClass('alert-success').html(msg).show();

								break;
							case 'N': // reprovado

								// Muda texto do botão de enviar
								$(parent.$('.fixedTopBar').find('button')[0]).html('Reprovar');
								$(parent.$('#workflowview-header').find('button')[0]).html('Reprovar');

								// mensagem de reprovação
								var msg = '<strong><i class="fa fa-times-circle" aria-hidden="true"></i> REPROVADO!</strong> Reprovação realizada por ' + nm + ' em ' + dt;
								$elAprovMsg.removeClass('alert-success').removeClass('alert-warning').addClass('alert-danger').html(msg).show();

								break;
							case 'A':

								// Muda texto do botão de enviar
								$(parent.$('.fixedTopBar').find('button')[0]).html('Ajuste');
								$(parent.$('#workflowview-header').find('button')[0]).html('Ajuste');

								// mensagem de Ajuste
								var msg = '<strong><i class="fa fa-times-circle" aria-hidden="true"></i> PEDIDO PARA AJUSTE!</strong> Reprovação para que seja ajustado. Realizada por ' + nm + ' em ' + dt;
								$elAprovMsg.removeClass('alert-danger').removeClass('alert-success').addClass('alert-warning').html(msg).show();

								break;

							case 'C':
								// mensagem de Ajuste
								var msg = '<strong><i class="fa fa-times-circle" aria-hidden="true"></i> PEDIDO PARA AJUSTE!</strong> Reprovação para que seja ajustado realizada por ' + nm + ' em ' + dt;
								$elAprovMsg.removeClass('alert-danger').removeClass('alert-success').addClass('alert-warning').html(msg).show();

								break;

							default: // sem seleção
								console.error('Seleção na aprovação não reconhecida: ');
						};

					} else {    // se está desmarcando

						// oculta a mensagem
						$elAprovMsg.hide();

					};

				};

				$cmpAprov.on('change', function () {
					// atualiza a data no campo
					$cmpAprovDta.val(moment().format('DD/MM/YYYY HH:mm:ss'));
					$cmpAprovNom.val(infoUserActive.name);
					$cmpAprovCod.val(infoUserActive.code);
					$cmpAprovMail.val(infoUserActive.mail);
					$cmpAprov.valid()
					$cmpObs.valid()
					// exibe a mensagem no formulário
					exbMsgAprov(this.value, this.checked);
				});

				// Retira o check da seção de aprovação assim que a página é carregada
				console.info('Seção a ser desmarcada: ', fieldConfig)
				$('input[name="APROVADO' + fieldConfig.name + '"]:checked').prop('checked', false);

				this.valid(fieldConfig, $cmpAprov, $cmpObs)

			},

			valid: function (fieldConfig, $cmpAprov, $cmpObs) {
				$cmpAprov.rules('add', { required: true });
				$cmpObs.rules('add', { required: { depends: function (el) { return $('input[name="APROVADO' + fieldConfig.name + '"]:checked').val() != 'S' }, }, })
			}

		},

		//Objeto de configuração de elementos de data
		cep: {

			//parametro: objeto de configuração do campo
			init: function (fieldConfig) {

				$('[name="' + fieldConfig.name + '"]').mask("00.000-000"); //coloca mascara de cep

				this.start(fieldConfig);

			},

			start: function (fieldConfig) {

				$('[name="' + fieldConfig.name + '"]').blur(function () {

					//Nova variável "CEP" somente com digitos
					var CEP = $('[name="' + fieldConfig.name + '"]').val().replace(/\D/g, '');

					//Verifica se campo CEP possui valor informado.
					if (CEP != "") {

						//Expressão regular para validar o CEP.
						var validaCEP = /^[0-9]{8}$/;
						//Valida o formato do CEP.
						if (validaCEP.test(CEP)) {

							//Preenche os campos com "..." enquanto consulta webservice.
							$('[name="RUA' + fieldConfig.name + '"]').val("...");
							$('[name="BAIRRO' + fieldConfig.name + '"]').val("...");
							$('[name="CIDADE' + fieldConfig.name + '"]').val("...");
							$('[name="UF' + fieldConfig.name + '"]').val("...");

							var request = new XMLHttpRequest();
							request.open('GET', 'http://viacep.com.br/ws/' + CEP + '/json/');
							request.responseType = 'json';
							request.send();

							request.onload = function () {

								if (!("erro" in request.response)) {

									$('[name="RUA' + fieldConfig.name + '"]').val(request.response.logradouro);
									$('[name="BAIRRO' + fieldConfig.name + '"]').val(request.response.bairro);
									$('[name="CIDADE' + fieldConfig.name + '"]').val(request.response.localidade);
									$('[name="UF' + fieldConfig.name + '"]').val(request.response.uf);

								} else {
									//CEP não Encontrado.
									clearForm(fieldConfig.name);
									FLUIGC.toast({
										title: 'Erro!',
										message: 'CEP não encontrado!',
										type: 'warning'
									});
									$('[name="' + fieldConfig.name + '"]').val("");

								}

							}

						} //end if.
						else {
							//CEP envalido
							clearForm(fieldConfig.name);
							FLUIGC.toast({
								title: 'Erro!',
								message: 'Formato de CEP inválido!',
								type: 'warning'
							});
							$('[name="' + fieldConfig.name + '"]').val("");
						}
					} //end if.
					else {
						//CEP sem valor, limpa formulario.
						clearForm(fieldConfig.name);
					}

				});

			}

		}

	},

	sections: {

		//inicia procedimento de seções
		//parametros: numero da atividade, configuração de seções
		init: function (numState, sectionsConfig) {

			//Percorre configuração de seções dando as devidas tratativas pra cada uma
			sectionsConfig.forEach(function (sectionConfig) {

				//verifica Condições de exibição
				if (sectionConfig.visible) {
					$('.' + sectionConfig.id).show();

				} else {
					//caso atividade atual esteja dentro da lista exibe a section
					if (uFFw.utils.verificaConteudo(numState, sectionConfig.visibleAtv)) {

						$('.' + sectionConfig.id).show()
					}
				};

				//verifica Condições de edição
				if (!sectionConfig.enabled) {

					$('.' + sectionConfig.id).setDisabled();

				} else {

					//caso atividade atual não esteja dentro da lista, aplica o setDisabled
					if (!uFFw.utils.verificaConteudo(numState, sectionConfig.enabledAtv)) {

						$('.' + sectionConfig.id).setDisabled()
					}


				};


				if (typeof sectionConfig.customActions != 'undefined') {


					sectionConfig.customActions($('.' + sectionConfig.id));


				}



			})
		},


	},

	utils: {

		addClass: {

			init: function (fieldConfig) {

				if (typeof fieldConfig.class != 'undefined') {

					if (fieldConfig.class.length != 0) {

						this.start($('[name="' + fieldConfig.name + '"]'), fieldConfig.class);


					}

				};

			},

			start: function ($el, listClass) {

				listClass.forEach(function (classe) {

					$el.addClass(classe);

				});


			}



		},

		getTotalValue: function (QUANT, VALOR) {

			var final = QUANT.parseReais() * VALOR.parseReais()

			return final.formatReais()
		},

		setTotalValue: function ($QUANT, $VALOR, $TOTAL) {

			var final = $QUANT.val().parseReais() * $VALOR.val().parseReais()

			$TOTAL.val(final.formatReais())
		},


		/**
		 * Retorna a lista (string de html) de campos não validados e respectivas mensagem
		 */
		listaErros: function () {
			var lstHtml = '<br/>';
			$.each($validator.errorList, function (id, campo) {
				var label = $('label.control-label[for="' + campo.element.name + '"]').text().replace(/(\r\n|\n|\r)/gm, "").replace('/\t/g', '');;

				if (label != '') {
					lstHtml += '<strong>' + ((label != undefined) ? label : campo.element.name).toUpperCase() + '</strong>: ' + campo.message
					lstHtml += '<br/>'
				}



			})
			return lstHtml;
		},
		//objeto de tratativa de validação em campos
		validate: {

			init: function (fieldConfig) {

				if (typeof fieldConfig.validate == 'undefined') {

					//validação vazia
					//não existe demanda para tal funcionabilidade


				} else {


					if (fieldConfig.validate.length > 0) {

						fieldConfig.validate.forEach(function (typeValidation) {

							if (typeof fieldConfig.requiredConfig == 'undefined') {

								uFFw.utils.validate.start($('[name="' + fieldConfig.name + '"]'), typeValidation, uFFw.defaults.validOptions, fieldConfig.validationCascade);

							} else {

								uFFw.utils.validate.start($('[name="' + fieldConfig.name + '"]'), typeValidation, fieldConfig.requiredConfig, fieldConfig.validationCascade);

							}

						})

					}

				}

			},

			//inicia validação em um elemento
			//parametros: elemento jquery do campo, configuração (padrão quando elemento é visivel)
			start: function ($el, typeValidation, config, validationCascade = {}) {
				var objConfig = {}
				if (typeof typeValidation == "function") {
					objConfig["callback"] = typeValidation
				} else {
					objConfig[typeValidation] = config;
				}

				$el.rules('add', objConfig);

				const { eventToValidate = 'change', fieldsToValidate = undefined } = validationCascade
				$el.parents('.form-group').on(eventToValidate, function () {
					$(`[name="${$el.attr('name')}"]`).valid()
					if (fieldsToValidate) {
						fieldsToValidate.forEach(function (fieldName) {
							$(`[name="${fieldName}"]`).valid()
						})
					}

				})

			}
		},



		//verifica se o conteudo passado esta na lista
		verificaConteudo: function (conteudo, lista) {
			if (lista == "all") return true
			return lista.some(function (conteudoLoop) {
				return conteudo == conteudoLoop
			});
		}



	},

};


/**
 * @desc   	Desabilita todos os campos colocando-os no formato de VIEW do Fluig
 * @version	2.3.0
 */
$.fn.fluigZoomConfig = function (fieldConfig, options) {
	var jsonOptions = JSON.stringify(options)
	var elName = '[name="' + fieldConfig.name + '"]'

	$(elName).data('zoom', jsonOptions)

	if (fieldConfig.callbacks) {
		if (fieldConfig.callbacks.onAdd) {
			uFFw.fields.zoomFluig.add[fieldConfig.name] = fieldConfig.callbacks.onAdd
		}
		if (fieldConfig.callbacks.onRemove) {
			uFFw.fields.zoomFluig.remove[fieldConfig.name] = fieldConfig.callbacks.onRemove
		}
	}

	if (fieldConfig.constraints) {
		var constraints = fieldConfig.constraints.reduce(function (elAcumulador, elAtual) {
			elAcumulador += elAtual.field + ',' + elAtual.value + ','
			return elAcumulador
		},
			""
		)
		constraints = constraints.substr(0, constraints.length - 1)
		reloadZoomFilterValues(fieldConfig.name, constraints)
	}

}

$.fn.setDisabled = function () {
	console.info('DESABILITA', $(this), 'Desabilita os elementos.');

	var $el = $(this);  // resgata o elemento atual

	// retira a(s) opção(es) de remover linha da(s) tabela(s)
	$el.find('tbody tr:not(:first-child) td.acoes-linha a.remove-linha').hide();

	// oculta todos os botões zoom da seção
	$el.find('div.form-group button[uf-zoom]').hide();

	// desabilita todos os botões
	$el.find('button[type="button"]').attr('disabled', true);

	// oculta os addons e botões agrupados aos campos
	$el.find('div.form-group div.input-group .input-group-addon').hide();
	$el.find('div.form-group div.input-group .input-group-btn').hide();

	// retira a classe .input-group para melhor formatação do valor do campo
	$el.find('div.form-group div.input-group').attr('class', '');

	// oculta todos os help-block da seção
	$el.find('div.form-group p.help-block').hide();

	// retira as mensagens indicadas para serem retiradas no modo view
	$el.find('[retirar-view]').hide();

	// define a altura dos elementos para melhor visual da tela (principalmente para <textarea>)
	$el.find('span.form-control').css('height', 'auto');

	// percorre todos os inputs do tipo radios que estão marcados
	$el.find('input[type="radio"]:checked').each(function () {

		// resgata o valor que será exbido
		var conteudo = $(this).data('exibicao');

		// resgata nome do campo
		var nm = $(this).attr('name');

		// resgata o elemento pai de todos os radios
		var $pai = $(this).parents('div.btn-group');
		$pai.hide();    // oculta ele

		if ($pai.parent().find('.unicElementDisabled').length == 0) {
			// adiciona um novo elemento com o valor do campo e seus atributos
			$('<span>', { html: conteudo, 'data-idoriginal': nm }).addClass('form-control').addClass('unicElementDisabled').insertAfter($pai)
		}
	});

	// percorre os radios não marcados e oculta o button
	$el.find('input[type="radio"]:not(:checked)').each(function () {
		$(this).parents('label').hide();
	});

	// retira os eventos do mouse dos campos checkbox
	$el.find('div.checkbox').css('pointer-events', 'none');

	// percorre todos os elementos com .form-control
	$el.find('.form-group:not(.uf-disabled) .form-control:not([type="hidden"])').each(function () {
		var el = $(this);
		var valor, id = '';

		// verifica o nome do elemento
		switch (this.localName) {
			case 'input':
			case 'textarea':
				desabilitar(el, this.value, el.attr('name'));
				break;
			case 'select':
				desabilitar(el, el.find('option:selected').text(), el.attr('name'));
				break;
		};

	});

	// função que cria um novo elemento e esconde o campo original
	function desabilitar(elemento, valor, id) {

		// resgata as classes aplicadas ao elemento
		var cls = elemento.attr('class');

		// se houver input com a classe de código do zoom (codinput)
		var cod = elemento.parents('.ufZoom').find('input.codinput').val();
		if (cod) valor = cod + ' - ' + valor;

		// adiciona um novo elemento (logo após o original) com o valor do campo e seus atributos
		$('<span>', { html: valor, 'data-idoriginal': id }).addClass(cls).insertAfter(elemento);

		// adiciona uma classe informativa no elemento
		// para não desabilitar duas vezes quando for chamada
		// a função duas vezes no mesmo elemento
		elemento.parents('.form-group').addClass('uf-disabled');

		// esconde o campo original do DOM
		elemento.hide();
	};
}



/**
 * @desc   	Inicializa o zoom no campo de acordo com as opções
 * @since   1.0.0
 */

$.fn.uFZoomBETA = function (zoomInfo, callback, listFields, sufix) {
	var $elZoom = $(this);

	// verifica se há o atributo de loading do bootstrap em todos os button do zoom
	// se já tiver, não adiciona novamente
	if (!$elZoom.attr('data-loading-text')) $elZoom.attr('data-loading-text', '<i class="fa fa-circle-o-notch fa-spin"></i>');

	// remove todos os eventos 'click' dos zooms já criados
	// para não dar incompatibilidade com a nova inicialização        
	// ao clicar em qualquer elemento para abrir o zoom
	$elZoom.off('click').on('click', function () {

		// este selZomm
		var $this = $(this);
		var tplContent = '';
		tplContent += '<div class="row">';
		tplContent += '<div class="col-xs-6"><caption>Utilize a pesquisa para encontrar o cadastro</caption></div>';
		tplContent += '<div class="col-xs-6">';
		tplContent += '<div class="form-group">';
		tplContent += '<div class="input-group">';
		tplContent += '<input type="search" class="form-control" placeholder="Pesquisar...">';
		tplContent += '<div class="input-group-btn"><button class="btn btn-default" type="button"><span class="fluigicon fluigicon-search"></span></button></div>';
		tplContent += '</div>';
		tplContent += '<p class="help-block small">Digite 3 ou mais caracteres e pressione "Enter" ou clique na lupa para filtrar a lista</p>';
		tplContent += '</div>';
		tplContent += '</div>';
		tplContent += '</div>';
		tplContent += '<div class="row">';
		tplContent += '<div class="col-xs-12">';
		tplContent += '<table class="table">';
		tplContent += '<thead></thead>';
		tplContent += '<tbody></tbody>';
		tplContent += '</table>';
		tplContent += '</div>';
		tplContent += '</div>';

		var zoomModal = FLUIGC.modal({
			title: zoomInfo.title,
			size: ((zoomInfo.size) ? zoomInfo.size : 'large'),  // full, large, small'
			content: tplContent,
			id: 'zoomModal',
			actions: [{
				label: 'Cancelar',
				autoClose: true,
				classType: 'btn btn-default',
			}, {
				label: 'INSERIR >',
				bind: 'data-inserirselecaozoom',
				classType: 'btn btn-primary',
			}]
		}, function (err, data) {
			if (err) {
				exbErro('Ocorreu um erro ao exibir o modal. Por favor, tente novamente.');
				console.error('Erro no FLUIGC.modal()', err);
				return; // cancela da função de zoom
			}
		});

		var msgLoading = FLUIGC.loading('#zoomModal', {
			textMessage: zoomInfo.loading,
			overlayCSS: {
				backgroundColor: '#fff',
				"border-radius": '6px',
				opacity: 0.6,
				cursor: 'wait'
			},
			baseZ: 1000,
			fadeIn: 200,
			fadeOut: 400,
			timeout: 0,
		});

		// resgata o input referente a este zoom
		var $cmp = $this.parents('.input-group').find('input');

		// oculta a barra padrão do Fluig
		parent.$('#workflowview-header').hide();

		// adiciona o informativo no rodapé
		$('#zoomModal .modal-footer').append($('<small>', { class: 'info pull-left', html: "<i class='fa fa-search' aria-hidden='true'></i> Inicie a pesquisa para localizar um " + zoomInfo.label }));
		$('#zoomModal .modal-body').css('max-height', '70%')

		/**
		 * @params
		 * 		@inputUsuario {string} : valor que o usuario digitou no campo de filtro
		 * @description
		 * 		funcao responsavel por pegar as constraints passsadas nas opcoes do zoom
		 * 		e transforma-las no formato para o AJAX
		 */
		var processaConstraint = function (inputUsuario) {
			// se há filtro na consulta, inicia a montagem das constraints
			if (zoomInfo.constraints.length > 0) {
				return zoomInfo.constraints.map(function (e, i) {
					// objeto de constraint padrao
					var defaultConstraint = {
						_field: "",
						_initialValue: '',
						_finalValue: '',
						_type: 2,	// type 2 significa constraint SHOULD
						_likeSearch: true
					}
					var constraint;
					// verifica a origem do valor do filtro
					switch (String(e.sourceVal)) {
						case '1':    // se o valor é fixo (sourceVal = 1), ou seja, passado direto pelo zoomInfo
							constraint = DatasetFactory.createConstraint(e.field, e.value, e.value, ConstraintType.SHOULD, true)
							break;
						case '2':   // se o valor é uma referência (sourceVal = 2), ou seja, vem de um campo do formulário
							var valorCampo = $('[name="' + e.formField + '"]').val()
							constraint = DatasetFactory.createConstraint(e.field, valorCampo, valorCampo, ConstraintType.SHOULD, true)
							break;
						case '3':	// se o usuario informa o valor (sourceVal = 3), ou seja, vem do filtro
							constraint = DatasetFactory.createConstraint(e.field, inputUsuario, inputUsuario, ConstraintType.SHOULD, true)
							break;
					};
					return constraint
					// return defaultConstraint
				});

			};
			return 'undefined'
		}


		// a inicialização do plugin DataTable deve ser feita
		// depois que o modal já está renderizado no DOM
		var dtZoom = $('#zoomModal').find('table').DataTable({
			dom: "<'row'<'col-xs-12't>><'row tabela-rodape'<'col-xs-12 col-md-5'i><'col-xs-12 col-md-7'p>>",
			language: {
				thousands: ".",
				zeroRecords: "<i class='fa fa-exclamation-circle' aria-hidden='true'></i> Nenhum item localizado",
				emptyTable: "<i class='fa fa-search' aria-hidden='true'></i> Inicie a pesquisa para localizar um(a) " + zoomInfo.label,
				info: "", //info: "Exibindo TOTAL itens",
				infoEmpty: "",
				infoFiltered: "",    //infoFiltered: "(filtro de um total de MAX itens)",
				paginate: {
					first: "Primeira",
					previous: "Anterior",
					next: "Próxima",
					last: "Última"
				},
				loadingRecords: "Pesquisando cadastro ...",
				processing: "Pesquisando ...",
			},
			columns: zoomInfo.columns,
			//data: listaZoom,
			paging: false,
			ordering: false,
			processing: true,
			serverSide: true,
			//deferLoading: 20,
			//deferLoading: [ 10, 20 ],
			deferRender: true,
			//searchDelay: 1000,  //millisecondss
			ajax: {
				url: '/api/public/ecm/dataset/datasets/',
				type: 'POST',
				dataType: 'json',
				headers: { "Content-Type": "application/json" },
				dataSrc: 'content.values',
				data: function (d) {
					// valor pesquisado no campos
					var valor = d.search.value;
					if (valor == '') valor = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
					//console.info('data do ajax: ', d);
					var objAPI = {
						name: zoomInfo.CodQuery,
						fields: zoomInfo.fields ? zoomInfo.fields : uFFw.defaults.zoomBetaFields,
						constraints: processaConstraint(valor) == 'undefined' ? uFFw.defaults.zoomBetaConstraints : processaConstraint(valor),
						order: null
					};
					return JSON.stringify(objAPI);
				}

			},
			createdRow: function (row, data, index) { // callback de adição de linha

				// ao clicar na linha (clique simples apenas para selecionar)
				$(row).on('click', function () {

					// se for a linha de tabela vazia, sai da function
					if ($(this).find('td').hasClass('dataTables_empty')) return;

					// se já estiver selecionada
					if ($(this).hasClass('selected')) {
						$(this).removeClass('selected');    // remove a classe de seleção
					} else {    // se ainda não estiver selecionada
						dtZoom.$('tr.selected').removeClass('selected'); // remove a seleção de todas as linhas
						$(this).addClass('selected');
					}
				});

				// ao da um duplo clique em uma das linhas
				$(row).on('dblclick', function () {

					// se for a linha de tabela vazia, sai da function
					if ($(this).find('td').hasClass('dataTables_empty')) return;

					// faz chamada para preenchimento do formulário
					//callback( $cmp, dtZoom.row(this).data() );
					callback($cmp, data, listFields, sufix);

					zoomModal.remove(); // fecha o modal do Fluig
					$('#zoomModal').remove(); // remove o modal do DOM

				});

			},
			drawCallback: function (settings) {
				console.log('drawCallback()', settings);

				// atualiza o informativo
				//var qtd = dtZoom.rows().count();
				var qtd = $(this).DataTable().rows().count();
				if (qtd == 0) {
					$('#zoomModal .modal-footer .info').html("<i class='fa fa-search' aria-hidden='true'></i> Inicie a pesquisa para localizar um registro");
				} else if (qtd == 1) {
					$('#zoomModal .modal-footer .info').html('Exibindo ' + qtd + ' de registros');
				} else {
					$('#zoomModal .modal-footer .info').html('Exibindo ' + qtd + ' de registros');
				}

				msgLoading.hide();
			},
		});

		// define ação de pesquisa e foca no campo de busca          
		$('#zoomModal input[type="search"]').keyup(function (e) {
			var code = e.which; // recommended to use e.which, it's normalized across browsers

			if (this.value == '') {
				//dtZoom.search("ABCDEFGHIJKLMNOPQRSTUVXYWZ").draw() ;
			} else if (e.which == 13 && this.value.length < 3) {
				parent.FLUIGC.toast({ title: 'Pesquisa!', message: 'Digite pelo menos 3 caracteres para buscar um registro.', type: 'warning', timeout: 3000 });
			} else if (e.which == 13 && this.value.length >= 3) {
				msgLoading.show();
				dtZoom.search(this.value).draw();
			}

			//dtZoom.search($(this).val()).draw() ;
		})
		if (!isMobile) $('#zoomModal input[type="search"]').focus()

		// ao clicar no botão
		$('#zoomModal button[type="button"]').on('click', function () {
			var val = String($('#zoomModal input[type="search"]').val());
			if (val == '') {
				//dtZoom.search("ABCDEFGHIJKLMNOPQRSTUVXYWZ").draw() ;
			} else if (val.length < 3) {
				parent.FLUIGC.toast({ title: 'Pesquisa!', message: 'Digite pelo menos 3 caracteres para buscar um registro.', type: 'warning', timeout: 3000 });
			} else if (val.length >= 3) {
				msgLoading.show();
				dtZoom.search(val).draw();
			}

			if (!isMobile) $('#zoomModal input[type="search"]').focus();
		});

		// ao fechar o modal
		$('#zoomModal').on('hide.bs.modal', function () {
			// exibe novamente a barra do fluig
			parent.$('#workflowview-header').show();
		});

		// evento click do botão de inserir do modal
		$('#zoomModal [data-inserirselecaozoom]').on('click', function () {

			// localiza a linha selecionada
			var $lin = $('#zoomModal table tbody tr.selected');

			// se não tiver linha selecionada, sai da funciton
			if (!$lin.length) return;

			// faz chamada para preenchimento do formulário
			callback($cmp, dtZoom.rows('.selected').data()[0], listFields, sufix);

			zoomModal.remove(); // fecha o modal do Fluig
			$('#zoomModal').remove(); // remove o modal do DOM
		});

		// função que exibe o erro para o usuário
		function exbErro(msg) {
			// exibe mensagem para o usuário
			parent.FLUIGC.toast({ title: 'Erro!', message: msg, type: 'danger', timeout: 4000 });
		};
	})
}


$.fn.uFZoom = function (zoomInfo, callback, listFields, sufix) {

	var $elZoom = $(this);

	// verifica se há o atributo de loading do bootstrap em todos os button do zoom
	// se já tiver, não adiciona novamente
	if (!$elZoom.attr('data-loading-text')) $elZoom.attr('data-loading-text', '<i class="fas fa-spinner fa-pulse"></i>');

	// verifica se eh desejado a opcao de limpar os campos do zoom
	// caso sim, adiciona o botao de limpar e limpa os campos de acordo com o array passado
	try {
		if (zoomInfo.clear && zoomInfo.clear.length) {
			var $btnClear = $('<button>', {
				type: 'button',
				class: "btn btn-default",
				html: '<span class="fluigicon fluigicon-remove-circle"></span>'
			})
			$btnClear.on('click', function () {
				zoomInfo.clear.forEach(function (e) {
					var $elemento = $(`[name="${e.name}"]`)
					var linha = $elZoom.parents('tr')
					// significa que eh um pai filho
					if (linha.length && linha.find(`[name^="${e.name}_"]`).length)
						var $elemento = $elZoom.parents('tr').find(`[name^="${e.name}_"]`)
					$elemento.val('')
					if (e.trigger)
						$elemento.trigger(e.trigger)
					if (e.afterClear)
						e.afterClear($elemento)
				})
			})
			// adiciona o botao apos o botao do zoom
			$elZoom.after($btnClear)
		}
	} catch (e) {
		console.error('Ocorreu um erro na criacao do botao de limpar o zoom:', e)
	}

	// remove todos os eventos 'click' dos zooms já criados
	// para não dar incompatibilidade com a nova inicialização        
	// ao clicar em qualquer elemento para abrir o zoom
	$elZoom.off('click').on('click', function () {

		// este selZomm
		var $this = $(this);

		var msgLoading = FLUIGC.loading(window, {
			textMessage: zoomInfo.loading,
			overlayCSS: {
				backgroundColor: '#000',
				opacity: 0.6,
				cursor: 'wait'
			},
			baseZ: 1000,
			fadeIn: 200,
			fadeOut: 400,
			timeout: 0,
		});
		msgLoading.show();

		$this.button('loading');    // troca o ícone

		var DataSetName; // nome do DataSet que será consultado
		var parametros; // parâmetros para chamar o DataSet
		var filtros = null; // filtros para a query no RM

		// objeto global que receberá a lista de cada zoom utilizado no formulário
		// esse objeto é populado dinamicamente de acordo com o uso no uFZoom
		// o objetivo é dinamizar as consultas evitando acessar o servidor
		// a todo momento, deixando assim, a lista armazenada localmente
		if (typeof lstZoom == 'undefined') lstZoom = {};

		if (zoomInfo.serverSide)
			return exbTabela([])

		// verifica se há informado uma variável para armazenar o resultado
		// e se a lista desse zoom já está armazenada na variável
		if (zoomInfo.lstLocal != undefined) {
			if (lstZoom[zoomInfo.lstLocal] != undefined) {
				exbTabela(lstZoom[zoomInfo.lstLocal]);	// chama a função para preenchimento
				return;	// saí do zoom
			}
		}
		// monta os filtros e parâmetros para consulta ao DataSet
		try {

			// verifica o tipo de consulta ao RM (via DataSever ou ConsultaSQL)
			switch (String(zoomInfo.uFZommType)) {
				case '1':    // consulta no RM utilizando DataServer (ds_RMDataServer)

					DataSetName = 'ds_RMDataServer';    // consulta dinâminca de DataServer do RM

					// se não informou a coligada, utiliza a 1
					var CODCOLIGADA = ((zoomInfo.CODCOLIGADA) ? zoomInfo.CODCOLIGADA : '1');

					// monta parâmetros (na ordem): NOMEDATASERVER, CODCOLIGADA, CONTEXTO
					//parametros = new Array(zoomInfo.CodQuery, CODCOLIGADA, "");
					parametros = new Array(zoomInfo.CodQuery, "", "CODCOLIGADA=" + CODCOLIGADA);

					break;
				case '2':    // consulta no RM utilizando ConsultaSQL (ds_RMConsulta)

					DataSetName = 'ds_RMConsulta';    // consulta dinâminca de query do RM

					// monta parâmetros (na ordem): CODSENTECA, CODCOLIGADA, APLICACAO
					parametros = new Array(zoomInfo.CodQuery, "0", "T"); // consultas gravadas na coligada global (0) do RM

					break;
				case '3':    // consulta no RM utilizando um DataSet específico

					DataSetName = zoomInfo.CodQuery;    // resgata o nome do DataSet no html

					// não passa parâmetros
					parametros = zoomInfo.fields ? zoomInfo.fields : null

					break;
				case '4':    // consulta utilizando uma query

					DataSetName = 'ds_FLUIGConsulta';    // dataset de select query

					// monta parâmetros: QUERY
					parametros = new Array(zoomInfo.CodQuery); // informa a query

					break;
				case '5':    // consulta utilizando um array já pronto

					DataSetName = '';    // não exite dataset para este tipo
					parametros = ''// não exite parâmetros para este tipo

					break;
				case '6':    // consulta utilizando um grupo

					DataSetName = '';    // não exite dataset para este tipo
					parametros = ''// não exite parâmetros para este tipo

					break;
				default:
					throw 'Tipo de uFZoom desconhecido';
			};

			// se há filtro na consulta, inicia a montagem das constraints
			if (zoomInfo.constraints.length > 0) {

				// percorre os constraints formatando os filtros
				filtros = [];   // transforma a variável em array
				$.each(zoomInfo.constraints, function () {

					// verifica a origem do valor do filtro
					switch (String(this.sourceVal)) {
						case '1':    // se o valor é fixo (sourceVal = 1), ou seja, passado direto pelo zoomInfo
							filtros.push(DatasetFactory.createConstraint(this.field, this.value, this.value, ConstraintType.MUST));
							break;
						case '2':   // se o valor é uma referência (sourceVal = 2), ou seja, vem de um campo do formulário
							var valor = $('form input[name="' + this.formField + '"]').val();
							filtros.push(DatasetFactory.createConstraint(this.field, valor, valor, ConstraintType.MUST));
							break;
						case '3':	// se é uma função que retorna o objeto constraint
							var cons = ((typeof this.value == 'function') ? this.value() : this.value);
							filtros.push(cons);
							break;
						case '4':	// se é uma variável global
							filtros.push(DatasetFactory.createConstraint(this.field, eval(this.value), eval(this.value), ConstraintType.MUST));
							break;
						case '5':   // se o valor é uma referência (sourceVal = 2), ou seja, vem de um campo do formulário
							var valor = $('form input[name="' + this.formField + '"]').val();
							filtros.push(DatasetFactory.createConstraint(this.field, valor, valor, ConstraintType.SHOULD));
							break;
						case '6':    // se o valor é fixo (sourceVal = 1), ou seja, passado direto pelo zoomInfo
							filtros.push(DatasetFactory.createConstraint(this.field, this.value, this.value, ConstraintType.SHOULD));
							break;
					};

				});

			};

		} catch (e) {
			exbErro('Ocorreu um erro ao montar os filtros da lista. Por favor, tente novamente.');
			console.error('Ocorreu um erro ao montar os filtros e parâmetros do DataSet:', e);
		};

		// se é um array local, não consulta o servidor
		if (zoomInfo.uFZommType == '5') {

			try {

				// valida se a variável informada é mesmo um array
				if (!Array.isArray(zoomInfo.CodQuery)) throw 'Array inválido!';

				// faz a chamada do modal com os dados do array
				if (zoomInfo.lstLocal != undefined) lstZoom[zoomInfo.lstLocal] = zoomInfo.CodQuery;	// cria/atualiza a lista localmente
				exbTabela(zoomInfo.CodQuery);	// chama a função para preenchimento

			} catch (e) {
				console.error('A variável informada não é um array:', e);
				exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.');
				return; // cancela da função de zoom
			};

		} else if (zoomInfo.uFZommType == '6') {  // consulta grupo pela API

			try {

				// consulta a API de grupos para listar os usuários
				$.ajax({
					type: 'GET',
					url: '/api/public/2.0/groups/listUsersByGroup/' + zoomInfo.CodQuery,
					success: function (data, textStatus, jqXHR) { // tipos de dados: Anything, String, jqXHR
						console.info('Resposta do ajax: ', data, textStatus);
						if (!Array.isArray(data.content)) {
							exbErro('Resposta da API inválida!');
							return;
						} else {

							// faz a chamada do modal com os dados do array
							if (zoomInfo.lstLocal != undefined) lstZoom[zoomInfo.lstLocal] = data.content;	// cria/atualiza a lista localmente
							exbTabela(data.content);	// chama a função para preenchimento

						};

					},
					error: function (jqXHR, textStatus, errorThrown) { // tipos de dados: jqXHR, String, String
						console.error('RESPOSTA vcXMLRPC com erro', jqXHR, textStatus, errorThrown);
						var msg = ((jqXHR.responseJSON !== undefined) ? jqXHR.responseJSON.message : textStatus);
						exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.<br>Detalhes: ' + msg);
					},
				});

			} catch (e) {
				exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.<br>' + e);
				return; // cancela da função de zoom
			};

		} else {

			if (zoomInfo.cliente == 'tbc') {

				var pesq = $this.parents('tr').find('input[name^="ITMNOME"]').val();

				var fina = $('[name="FINALIDCOD"]').val();

				parametros = zoomInfo.colunas;

				var filtros = [];
				filtros.push(DatasetFactory.createConstraint('codSentenca', 'WS.0004', 'WS.0004', ConstraintType.MUST));
				filtros.push(DatasetFactory.createConstraint('codColigada', '1', '1', ConstraintType.MUST));
				filtros.push(DatasetFactory.createConstraint('codAplicacao', 'T', 'T', ConstraintType.MUST));
				filtros.push(DatasetFactory.createConstraint('CODIGO', pesq, pesq, ConstraintType.MUST));
				filtros.push(DatasetFactory.createConstraint('TIPO', fina, fina, ConstraintType.MUST));

				try {
					// consulta DataSet no servidor
					DatasetFactory.getDataset(DataSetName, parametros, filtros, null, {
						success: function (content) {
							console.info('RESPOSTA vcXMLRPC com sucesso', content);

							exbTabela(content.values);	// chama a função para preenchimento

						},
						error: function (jqXHR, textStatus, errorThrown) {
							console.error('RESPOSTA vcXMLRPC com erro', jqXHR, textStatus, errorThrown);
							var msg = ((jqXHR.responseJSON !== undefined) ? jqXHR.responseJSON.message : textStatus);   // resgata a mensagem de erro real que acorreu com o DataSet
							exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.<br>Detalhes: ' + msg);
						},
					});
				} catch (e) {
					console.error('Ocorreu um erro ao consultar o DataSet:', e);
					exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.');
					return; // cancela da função de zoom
				};

			} else {

				// realiza consulta no DataSet conforme parâmetros
				try {

					// consulta DataSet no servidor
					DatasetFactory.getDataset(DataSetName, parametros, filtros, null, {

						success: function (content) {
							console.info('RESPOSTA vcXMLRPC com sucesso', content);
							// verifica se o DataSet retornou um erro
							if (content.values.length == 1 && content.columns[0] == 'ERRO') { // se há apenas uma linha e a coluna chama-se ERRO
								console.error('O DataSet foi consultado, mas retornou um erro:', content.values[0]);
								exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.<br>Detalhes: ' + content.values[0].ERRO);
							} else {    // se não há a coluna ERRO
								if (zoomInfo.distinct) {
									content.values = content.values.reduce(function (a, b, c) {
										var achou = a.find(function (d) { return d[zoomInfo.distinctInput].toLocaleLowerCase() == b[zoomInfo.distinctInput].toLocaleLowerCase() })
										if (typeof achou == 'undefined') a.push(b)
										return a
									}, [])
								}

								if (zoomInfo.lstLocal != undefined) lstZoom[zoomInfo.lstLocal] = content.values;	// cria/atualiza a lista localmente
								if (DataSetName == "colleague") {
									let updatedData = content.values.map(item => {
										let newItem = { ...item }; // Clona o objeto para evitar mutação direta

										if (newItem["colleaguePK.colleagueId"]) {
											newItem["MATRICULA"] = newItem["colleaguePK.colleagueId"];
											delete newItem["colleaguePK.colleagueId"]; // Remove a chave antiga
										}

										return newItem;
									});

									exbTabela(updatedData);	// chama a função para preenchimento
								}
								else {

									exbTabela(content.values);	// chama a função para preenchimento
								}
							}
						},
						error: function (jqXHR, textStatus, errorThrown) {
							console.error('RESPOSTA vcXMLRPC com erro', jqXHR, textStatus, errorThrown);
							var msg = ((jqXHR.responseJSON !== undefined) ? jqXHR.responseJSON.message : textStatus);   // resgata a mensagem de erro real que acorreu com o DataSet
							exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.<br>Detalhes: ' + msg);
						},
					});
				} catch (e) {
					console.error('Ocorreu um erro ao consultar o DataSet:', e);
					exbErro('Ocorreu um erro ao consultar o cadastro de ' + zoomInfo.label + '. Por favor, tente novamente.');
					return; // cancela da função de zoom
				};

			}
		}

		if (zoomInfo.serverSide) {
			//verifica se tem as keys nevessarias
			const { objSearch = false } = zoomInfo.serverSide
			if (objSearch === false)
				throw Error("O parâmetro objSearch está faltando!")
			return exbTabela([])
		}

		function exbTabela(listaZoom) {
			// monta o HTML do modal
			let tplContent = '';
			tplContent += '<div class="row">';
			tplContent += '  <div class="col-xs-6"><caption>Selecione um item da tabela</caption></div>';
			tplContent += '  <div class="col-xs-6">';
			tplContent += '    <div class="form-group">';
			tplContent += '      <div class="input-group">';
			tplContent += '        <input type="search" class="form-control" placeholder="Pesquisar ...">';
			tplContent += '        <div class="input-group-addon"><span class="fluigicon fluigicon-search"></span></div>';
			tplContent += '      </div>';
			tplContent += '    </div>';
			tplContent += '  </div>';
			tplContent += '</div>';
			tplContent += '<div class="row">';
			tplContent += '  <div class="col-xs-12">';
			tplContent += '    <table class="table">';
			tplContent += '      <thead></thead>';
			tplContent += '      <tbody></tbody>';
			tplContent += '    </table>';
			tplContent += '  </div>';
			tplContent += '</div>';

			// abre o modal
			const zoomModal = FLUIGC.modal({
				title: zoomInfo.title,
				size: zoomInfo.size || 'large',
				content: tplContent,
				formModal: true,
				id: 'zoomModal',
				actions: [
					{ label: 'Cancelar', autoClose: true, classType: 'btn btn-default' },
					{ label: 'INSERIR >', bind: 'data-inserirselecaozoom', classType: 'btn btn-primary' }
				]
			}, (err) => {
				if (err) {
					exbErro('Erro ao exibir o modal.');
					console.error(err);
				}
			});

			// esconde a barra padrão do Fluig
			parent.$('#workflowview-header').hide();

			// destrói instância anterior, caso exista
			const $table = $('#zoomModal').find('table');
			if ($.fn.DataTable.isDataTable($table)) {
				$table.DataTable().destroy();
				$table.find('tbody').empty();
			}

			// configurações básicas do DataTable
			let config = {
				dom: "<'row'<'col-xs-12't>><'row tabela-rodape'<'col-xs-12 col-md-5'i><'col-xs-12 col-md-7'p>>",
				language: {
					thousands: ".",
					zeroRecords: "<i class='fa fa-exclamation-circle'></i> Nenhum item localizado",
					emptyTable: "<i class='fa fa-exclamation-circle'></i> Nenhum item localizado",
					info: "Exibindo _TOTAL_ itens",
					infoEmpty: "Nenhum item localizado",
					infoFiltered: "(filtro de um total de _MAX_ itens)",
					paginate: { first: "Primeira", previous: "Anterior", next: "Próxima", last: "Última" }
				},
				columns: zoomInfo.columns,
				data: listaZoom,
				paging: false,
				destroy: true          // permite reinicializar sem erro
			};

			// se for server-side, adiciona as opções
			if (zoomInfo.serverSide) {
				const pageSize = zoomInfo.serverSide.pageSize || 25;
				Object.assign(config, {
					deferRender: true,
					processing: true,
					serverSide: true,
					paging: true,
					pageLength: pageSize,
					data: undefined,
					ajax(data, callback) {
						(async () => {
							FLUIGC.loading($('#zoomModal')).show();
							try {
								const args = data.search.value && zoomInfo.serverSide.searchWithValue
									? zoomInfo.serverSide.searchWithValue({ value: data.search.value })
									: zoomInfo.serverSide.objSearch({
										start: data.start + 1,
										pageSize,
										page: (data.start + pageSize) / pageSize
									});
								const { dados } = await args;
								if (!dados) throw 'Dados inválidos';
								callback({
									draw: data.draw,
									data: dados,
									recordsTotal: zoomInfo.serverSide.total,
									recordsFiltered: zoomInfo.serverSide.total
								});
							} catch (e) {
								console.error(e);
								exbErro(e);
							} finally {
								FLUIGC.loading($('#zoomModal')).hide();
							}
						})();
					}
				});
			}

			// inicializa o DataTable
			const dtZoom = $table.DataTable(config);

			// eventos fora do drawCallback, garantindo um único binding

			// 1) Pesquisa
			$('#zoomModal input[type="search"]')
				.off('keyup')
				.on('keyup', function () {
					const term = $(this).val();
					if (zoomInfo.serverSide) {
						clearTimeout(this._timer);
						this._timer = setTimeout(() => dtZoom.search(term).draw(), zoomInfo.serverSide.searchTimer || 250);
					} else {
						dtZoom.search(term).draw();
					}
				})
				.focus();

			// 2) Seleção de linha (simples)
			$('#zoomModal table tbody')
				.off('click', 'tr')
				.on('click', 'tr', function () {
					if ($(this).find('td').hasClass('dataTables_empty')) return;
					dtZoom.$('tr.selected').removeClass('selected');
					$(this).toggleClass('selected');
				});

			// 3) Duplo-clique
			$('#zoomModal table tbody')
				.off('dblclick', 'tr')
				.on('dblclick', 'tr', function () {
					if ($(this).find('td').hasClass('dataTables_empty')) return;
					const data = dtZoom.row(this).data();
					const $cmp = $this.parents('.input-group').find('input');
					callback($cmp, data, listFields, sufix);
					zoomModal.remove();
					$('#zoomModal').remove();
				});

			// 4) Botão INSERIR
			$('#zoomModal')
				.off('click', '[data-inserirselecaozoom]')
				.on('click', '[data-inserirselecaozoom]', function () {
					const $sel = $('#zoomModal table tbody tr.selected');
					if (!$sel.length) return;
					const data = dtZoom.rows('.selected').data()[0];
					const $cmp = $this.parents('.input-group').find('input');
					callback($cmp, data, listFields, sufix);
					zoomModal.remove();
					$('#zoomModal').remove();
				});

			// ao fechar, mostra a barra do Fluig
			$('#zoomModal').on('hide.bs.modal', () => {
				parent.$('#workflowview-header').show();
			});

			// ajusta altura máxima do body do modal
			$('#zoomModal .modal-body')
				.css('max-height', (window.innerHeight - 200) + 'px')
				.css('overflow-x', 'hidden');

			$(window).trigger('resize');
			msgLoading.hide();
			$this.button('reset');
		}

		// função que exibe o erro para o usuário
		function exbErro(msg) {
			// exibe mensagem para o usuário
			parent.FLUIGC.toast({ title: 'Erro!', message: msg, type: 'danger', timeout: 4000 });
			// espera um tempo (2s antes do toast) e oculta o loading
			msgLoading.hide(); $this.button('reset');
		};

	});
}

$.validator.setDefaults({	// opções comuns do validate()
	ignore: '',
	highlight: function (element, errorClass, validClass) {
		$(element).closest('.form-group').removeClass('has-success').addClass('has-error');	  // resgata o elemento anterior e adiciona a classe de erro
		const name = $(element).attr('name')
		if (uFFw.fields.listErrorCallBack[name]) uFFw.fields.listErrorCallBack[name]($(element))
	},
	unhighlight: function (element, errorClass, validClass) {
		$(element).closest('.form-group').removeClass('has-error').addClass('has-success');   // resgata o elemento anterior e adiciona a classe de sucesso
	},
	success: function (label, element) {
		const name = $(element).attr('name')
		if (uFFw.fields.listSuccessCallBack[name]) uFFw.fields.listSuccessCallBack[name]($(element))
	},
	errorPlacement: function (error, element) {  // proteção para feedback em campos do bootstrap
		var frmGrp = element.closest('div.form-group');  // tenta resgatar o form-group
		if (frmGrp.length) {  // se existe o grupo
			error.appendTo(frmGrp);  // adiciona o elemento de erro no final do form-group
		}
		else {
			error.insertAfter(element);   // adiciona o elemento de erro após o campo (ação padrão)  
		}

	}
});

/**
* Tradução do jQuery Validator
 */
(function (factory) {
	if (typeof define === "function" && define.amd) {
		define(["jquery", "../jquery.validate"], factory);
	} else if (typeof module === "object" && module.exports) {
		module.exports = factory(require("jquery"));
	} else {
		factory(jQuery);
	}
}(function ($) {
	$.extend($.validator.messages, {

		// Core
		required: "Este campo &eacute; obrigatório.",
		remote: "Por favor, corrija este campo.",
		email: "Por favor, forne&ccedil;a um endere&ccedil;o de email v&aacute;lido.",
		url: "Por favor, forne&ccedil;a uma URL v&aacute;lida.",
		date: "Por favor, forne&ccedil;a uma data v&aacute;lida.",
		dateISO: "Por favor, forne&ccedil;a uma data v&aacute;lida (ISO).",
		number: "Por favor, forne&ccedil;a um n&uacute;mero v&aacute;lido.",
		digits: "Por favor, forne&ccedil;a somente d&iacute;gitos.",
		creditcard: "Por favor, forne&ccedil;a um cart&atilde;o de cr&eacute;dito v&aacute;lido.",
		equalTo: "Por favor, forne&ccedil;a o mesmo valor novamente.",
		maxlength: $.validator.format("Por favor, forne&ccedil;a n&atilde;o mais que {0} caracteres."),
		minlength: $.validator.format("Por favor, forne&ccedil;a ao menos {0} caracteres."),
		rangelength: $.validator.format("Por favor, forne&ccedil;a um valor entre {0} e {1} caracteres de comprimento."),
		range: $.validator.format("Por favor, forne&ccedil;a um valor entre {0} e {1}."),
		max: $.validator.format("Por favor, forne&ccedil;a um valor menor ou igual a {0}."),
		min: $.validator.format("Por favor, forne&ccedil;a um valor maior ou igual a {0}."),
		// Metodos Adicionais
		maxWords: $.validator.format("Por favor, forne&ccedil;a com {0} palavras ou menos."),
		minWords: $.validator.format("Por favor, forne&ccedil;a pelo menos {0} palavras."),
		rangeWords: $.validator.format("Por favor, forne&ccedil;a entre {0} e {1} palavras."),
		accept: "Por favor, forne&ccedil;a um tipo v&aacute;lido.",
		alphanumeric: "Por favor, forne&ccedil;a somente com letras, n&uacute;meros e sublinhados.",
		bankaccountNL: "Por favor, forne&ccedil;a com um n&uacute;mero de conta banc&aacute;ria v&aacute;lida.",
		bankorgiroaccountNL: "Por favor, forne&ccedil;a um banco v&aacute;lido ou n&uacute;mero de conta.",
		bic: "Por favor, forne&ccedil;a um c&oacute;digo BIC v&aacute;lido.",
		cifES: "Por favor, forne&ccedil;a um c&oacute;digo CIF v&aacute;lido.",
		creditcardtypes: "Por favor, forne&ccedil;a um n&uacute;mero de cart&atilde;o de cr&eacute;dito v&aacute;lido.",
		currency: "Por favor, forne&ccedil;a uma moeda v&aacute;lida.",
		dateFA: "Por favor, forne&ccedil;a uma data correta.",
		dateITA: "Por favor, forne&ccedil;a uma data correta.",
		dateNL: "Por favor, forne&ccedil;a uma data correta.",
		extension: "Por favor, forne&ccedil;a um valor com uma extens&atilde;o v&aacute;lida.",
		giroaccountNL: "Por favor, forne&ccedil;a um n&uacute;mero de conta corrente v&aacute;lido.",
		iban: "Por favor, forne&ccedil;a um c&oacute;digo IBAN v&aacute;lido.",
		integer: "Por favor, forne&ccedil;a um n&uacute;mero n&atilde;o decimal.",
		ipv4: "Por favor, forne&ccedil;a um IPv4 v&aacute;lido.",
		ipv6: "Por favor, forne&ccedil;a um IPv6 v&aacute;lido.",
		lettersonly: "Por favor, forne&ccedil;a apenas com letras.",
		letterswithbasicpunc: "Por favor, forne&ccedil;a apenas letras ou pontua&ccedil;ões.",
		mobileNL: "Por favor, fornece&ccedil;a um n&uacute;mero v&aacute;lido de telefone.",
		mobileUK: "Por favor, fornece&ccedil;a um n&uacute;mero v&aacute;lido de telefone.",
		nieES: "Por favor, forne&ccedil;a um NIE v&aacute;lido.",
		nifES: "Por favor, forne&ccedil;a um NIF v&aacute;lido.",
		nowhitespace: "Por favor, n&atilde;o utilize espa&ccedil;os em branco.",
		pattern: "O formato fornenecido &eacute; inv&aacute;lido.",
		phoneNL: "Por favor, fornece&ccedil;a um n&uacute;mero de telefone v&aacute;lido.",
		phoneUK: "Por favor, fornece&ccedil;a um n&uacute;mero de telefone v&aacute;lido.",
		phoneUS: "Por favor, fornece&ccedil;a um n&uacute;mero de telefone v&aacute;lido.",
		phonesUK: "Por favor, fornece&ccedil;a um n&uacute;mero de telefone v&aacute;lido.",
		postalCodeCA: "Por favor, fornece&ccedil;a um n&uacute;mero de c&oacute;digo postal v&aacute;lido.",
		postalcodeIT: "Por favor, fornece&ccedil;a um n&uacute;mero de c&oacute;digo postal v&aacute;lido.",
		postalcodeNL: "Por favor, fornece&ccedil;a um n&uacute;mero de c&oacute;digo postal v&aacute;lido.",
		postcodeUK: "Por favor, fornece&ccedil;a um n&uacute;mero de c&oacute;digo postal v&aacute;lido.",
		postalcodeBR: "Por favor, forne&ccedil;a um CEP v&aacute;lido.",
		require_from_group: $.validator.format("Por favor, forne&ccedil;a pelo menos {0} destes campos."),
		skip_or_fill_minimum: $.validator.format("Por favor, optar entre ignorar esses campos ou preencher pelo menos {0} deles."),
		stateUS: "Por favor, forne&ccedil;a um estado v&aacute;lido.",
		strippedminlength: $.validator.format("Por favor, forne&ccedil;a pelo menos {0} caracteres."),
		time: "Por favor, forne&ccedil;a um hor&aacute;rio v&aacute;lido, no intervado de 00:00 e 23:59.",
		time12h: "Por favor, forne&ccedil;a um hor&aacute;rio v&aacute;lido, no intervado de 01:00 e 12:59 am/pm.",
		url2: "Por favor, fornece&ccedil;a uma URL v&aacute;lida.",
		vinUS: "O n&uacute;mero de iden" +
			"tifica&ccedil;&atilde;o de ve&iacute;culo informada (VIN) &eacute; inv&aacute;lido.",
		zipcodeUS: "Por favor, fornece&ccedil;a um c&oacute;digo postal americano v&aacute;lido.",
		ziprange: "O c&oacute;digo postal deve estar entre 902xx-xxxx e 905xx-xxxx",
		cpfBR: "Por favor, forne&ccedil;a um CPF v&aacute;lido."
	});
}));


/**
 * Formata o número para exibir em Reais Brasileiros
 */
Number.prototype.formatReais = function () {
	return 'R$ ' + Number(this).toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
};

/**
 * Formata o número para exibir a quantidade com até 2 casas decimais
 */
Number.prototype.formatQuantidade = function () {
	return '' + Number(this).toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});
};

/**
 * Formata o número para exibir a quantidade com até 4 casas decimais
 */
Number.prototype.formatQuantidadeIntegracao = function () {
	return '' + Number(this).toLocaleString('pt-BR', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4
	});
};

String.prototype.parseReais = function () {
	// retira os pontos, depois troca a vírgula por ponto
	var valor = this.replace(/\./g, "").replace(",", ".");
	return Number(valor.replace(/[^0-9\.]/g, ""));
}

$.validator.addMethod("isMaiorQueZero", function (value, element) {
	value = value.parseReais();
	return value > 0.00;
}, "Informe um valor maior que zero.");

function disableZoomField(field) {
	window[field].disable(true)
	$('[name=' + field + ']').parent().find('.select2-search__field').attr('readonly', true)
	$('[name=' + field + ']').parent().find('.select2-search__field').attr('tabindex', -1)
}

function enableZoomField(field) {
	window[field].disable(false)
	$('[name=' + field + ']').parent().find('.select2-search__field').attr('readonly', false)
	$('[name=' + field + ']').parent().find('.select2-search__field').attr('tabindex', 0)
}

function setSelectedZoomItem(selectedItem) {
	if (uFFw.fields.zoomFluig.add[selectedItem.inputName]) {
		uFFw.fields.zoomFluig.add[selectedItem.inputName]($('[name=' + selectedItem.inputName + ']'), selectedItem, selectedItem.inputName)
	}
}

function removedZoomItem(removedItem) {
	if (uFFw.fields.zoomFluig.remove[removedItem.inputName]) {
		uFFw.fields.zoomFluig.remove[removedItem.inputName]($('[name=' + removedItem.inputName + ']'), removedItem, removedItem.inputName)
	}
}

//funções relacionadas
function clearForm(fieldConfigName) {

	$('[name="RUA' + fieldConfigName + '"]').val("");
	$('[name="BAIRRO' + fieldConfigName + '"]').val("");
	$('[name="CIDADE' + fieldConfigName + '"]').val("");
	$('[name="UF' + fieldConfigName + '"]').val("");

}
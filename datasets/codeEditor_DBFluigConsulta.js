/**
 *
 * @desc        Realiza consulta ao banco de dados do Fluig
 * @copyright   2019 upFlow.me
 * @version     1.0.0
 *
 * @param       {array String} fields - Deve-se informar um array os seguintes valores:
                                        INDEX0 = Cód de Sentença (Ex.: '3');
                                        INDEX1...n = Valores para campos de filtro nas querys;
 * @param       {array Constraint} constraints - Deve-se informar o objeto contendo todos os filtros necessários para exectar a consulta
 * @param       {array String} sortFields - Não utilizado. Informar null
 * @return      {dataset} Retorna o resultado da consulta com todas as colunas
 *
 */
function createDataset(fields, constraints, sortFields) {
	log.info('uf-log | Chamada do DataSet codeEditor_DBFluigConsulta.js');

	// nome do datasource cadastrado no standalone.xml do Fluig
	var DATASOURCE = fields[1];

	var QUERY = ""; // variável da query que será executada
	var CODSENTENCA = ""; // código de sentença que localiza a query
	var FILTROS = ""; // filtros que serão aplicados a query

	// resgata as variaveis passadas através do parâmetro fields do DataSet
	if (fields == null)
		return exibeErro('Parâmetro fields em branco.');
	if (fields[0] == '')
		return exibeErro('Parâmetro fields em branco. Informe o Cód. de Sentença.');

	// define o valor do código de sentença
	CODSENTENCA = fields[0];

	try {

		FILTROS = parseConstraints(constraints);

	}
	catch (e) {
		return exibeErro('Erro ao criar filtros (linha: ' + e.lineNumber + '): ', e.message); // faz a chamada da função que exibe o erro
	}

	try {

		var CONSULTAINFO = lstConsulta[CODSENTENCA]; // consulta informações da sentença informada
		if (CONSULTAINFO == undefined)
			throw 'O Cód. de Sentença informado (' + CODSENTENCA + ') não é suportado pelo DataSet.';

		// informativo dos dados recebidos no log
		log.info("uf-log | Dados recebidos pelo dataset:");
		log.info("uf-log | DESCRIÇÃO: " + CONSULTAINFO.desc);
		log.info("uf-log | CODSENTENCA: " + CODSENTENCA);
		// log.info("uf-log | PARAMETROS: " + ((fields)?JSON.stringify(fields):'<vazio>') );
		log.info("uf-log | FILTROS: " + FILTROS);

	}
	catch (e) {
		return exibeErro('Erro nos parâmetros passados através do fields do DataSet: ', e); // faz a chamada da função que exibe o erro
	}

	// cria a query de acordo com o filtro informado
	try {

		// se tem filtro específico no fields[n] envia para montar a query
		QUERY = CONSULTAINFO.query(FILTROS, fields);

		log.info("uf-log | -- Query final a ser consultada \n" + QUERY);
		log.info("uf-log | -- Final da Query");

	}
	catch (e) {
		return exibeErro('Erro ao criar query (linha: ' + e.lineNumber + '): ', e.message); // faz a chamada da função que exibe o erro
	}
	;

	try {

		var newDataset = DatasetBuilder.newDataset();
		var ic = new javax.naming.InitialContext();
		var ds = ic.lookup(DATASOURCE);
		var created = false;

	}
	catch (e) {
		return exibeErro('Erro ao criar acessar base (linha: ' + e.lineNumber + '): ', e.message); // faz a chamada da função que exibe o erro
	}

	try {

		var conn = ds.getConnection();
		var stmt = conn.createStatement();

		// informativo da chamada no log
		log.info("uf-log | Executando consulta ao Banco Fluig:");

		var rs = null; // variavel que receberá a resposta

		// faz a chamada para execução da query
		switch (String(CONSULTAINFO.tipo)) {
			case 'SELECT':

				rs = stmt.executeQuery(QUERY);

				var columnCount = rs.getMetaData().getColumnCount();

				// loop no resultado criando as linhas do dataset
				while (rs.next()) {
					if (!created) {
						for (var i = 1; i <= columnCount; i++) {
							var column = rs.getMetaData().getColumnName(i);
							newDataset.addColumn(column);
						}
						created = true;
					}
					var Arr = new Array();
					for (var i = 1; i <= columnCount; i++) {
						var obj = rs.getObject(rs.getMetaData().getColumnName(i));
						if (null != obj) {
							Arr[i - 1] = rs.getObject(rs.getMetaData().getColumnName(i)).toString();
						}
						else {
							Arr[i - 1] = "null";
						}
					}
					newDataset.addRow(Arr);

				}

				break;
				
			case 'UPDATE':

				rs = stmt.executeUpdate(QUERY);

				newDataset.addColumn("ERRO");
				newDataset.addColumn("MSG");
				newDataset.addColumn("DETALHES");

				if (isNaN(rs)) { // não é numérico
					newDataset.addRow(new Array('1', 'Ocorreu um erro ao realizar a atualização do registro!', rs));
				}
				else {

					if (rs >= '1') {
						newDataset.addRow(new Array('0', 'Foram atualizados ' + rs + ' registros!', null));
					}
					else {
						newDataset.addRow(new Array('0', 'Nenhum registro foi atualizado!', null));
					}

				}

				break;
			case 'INSERT':

				rs = stmt.executeUpdate(QUERY);

				newDataset.addColumn("ERRO");
				newDataset.addColumn("MSG");
				newDataset.addColumn("DETALHES");
				
				
				if (rs) {
					newDataset.addRow(new Array('0', 'Registro inserido com sucesso!', rs));
				}
				else {
					newDataset.addRow(new Array('1', 'Ocorreu um erro ao realizar a inclusão do registro!', rs));
				}

				break;
			case 'DELETE':

				rs = stmt.executeUpdate(QUERY);

				newDataset.addColumn("ERRO");
				newDataset.addColumn("MSG");
				newDataset.addColumn("DETALHES");

				if (isNaN(rs)) { // não é numérico
					newDataset.addRow(new Array('1', 'Ocorreu um erro ao realizar a remoção do registro!', rs));
				}
				else {

					if (rs >= '1') {
						newDataset.addRow(new Array('0', 'Foram removidos ' + rs + ' registros!', null));
					}
					else {
						newDataset.addRow(new Array('0', 'Nenhum registro foi removido!', null));
					}

				}

				break;
				case 'CREATE':

					stmt.addBatch(QUERY);
					rs = stmt.executeBatch();
					stmt.clearBatch();
	
					newDataset.addColumn("ERRO");
					newDataset.addColumn("MSG");
					newDataset.addColumn("DETALHES");
					
					
					if (rs) {
						newDataset.addRow(new Array('0', 'Tabela criada com sucesso!', rs));
					}
					else {
						newDataset.addRow(new Array('1', 'Ocorreu um erro ao realizar a inclusão do registro!', rs));
					}
	
					break;
			default:
				return exibeErro('Erro ao criar acessar base (linha: ' + e.lineNumber + '): ', e.message); // faz a chamada da função que exibe o erro
		}

		// informativo do resultado da consulta
		log.info("uf-log | Chamada realizada com sucesso.");
		log.info("uf-log | -- Início do resultado \n" + rs);
		log.info("uf-log | -- Final do resultado");

	}
	catch (e) {
		return exibeErro('Erro ao executar a query (linha: ' + e.lineNumber + '): ', e.message); // faz a chamada da função que exibe o erro
	}
	finally {
		if (stmt != null)
			stmt.close();
		if (conn != null)
			conn.close();
	}

	return newDataset;

}

/**
 * @desc 	Localiza, monta e retorna a query conforme cod. sentença e filtros informado
 */
var lstConsulta = {
    
		1 : {
			tipo: 'SELECT',
			desc: 'SELECT GENÉRICO',
			query: function(filtros, cmpFiltro) {
				var parametros = JSON.parse(cmpFiltro[2]);
				var query = parametros.QUERY;
		        return String(query).replace(/\s{2,}/g, ' ');

			}
		},
		
};

/**
 * @desc 	Transforma o conceito de constraints do Fluig para o Filtro da Query
 * @param	{array Constraint} constraints - Deve-se informar o objeto contendo todos os filtros necessários para chamar a query
 */
function parseConstraints(constraints) {

	// se não foi passado nenhum filtro, retorna filtro vazio
	if (constraints == null || constraints.length <= 0)
		return "1=1";

	var filtro = ""; // resultado final do filtro

	// percorre as constraints
	for (var i = 0; i < constraints.length; i++) {
		var con = constraints[i];

		// MUST: indicates that all Dataset records must meet this condition.
		// SHOULD: indicates that the Dataset records may or may not meet the condition. This type is more common when you need the same field to have values A or B (where each will be a search condition with type SHOULD).
		// MUST_NOT: indicates that none of the records can satisfy the condition.

		filtro += "(";

		if (con.getConstraintType() == ConstraintType.SHOULD) {

			filtro += "(" + con.getFieldName() + "=" + con.getInitialValue() + ")";
			filtro += " OR ";
			filtro += "(" + con.getFieldName() + "=" + con.getFinalValue() + ")";

		}
		else {

			if (con.getInitialValue() == con.getFinalValue()) {

				filtro += con.getFieldName();
				if (ConstraintType.MUST == con.getConstraintType())
					filtro += " = ";
				if (ConstraintType.MUST_NOT == con.getConstraintType())
					filtro += " <> ";
				filtro += con.getInitialValue();

			}
			else {

				filtro += con.getFieldName() + " BETWEEN " + con.getInitialValue() + " AND " + con.getFinalValue();

			}

		}

		filtro += ")"; // fecha constraints
		filtro += " AND "; // se for a última constraints, isso será retirado

	}

	// retorna a string retirando o último " AND "
	return filtro.substr(0, (filtro.length - 5));

}

/**
 * @desc 	Exibe a mensagem de erro do console do Servidor e retorna uma coluna única com o erro para o usuário
 * @info	{string} msg - Mensagem de erro que será gravada no log e exibida ao usuário
 */
if (!Array.prototype.map) {

	Array.prototype.map = function(callback, thisArg) {

		var T, A, k;

		if (this == null) {
			throw new TypeError(' this is null or not defined');
		}

		// 1. Let O be the result of calling ToObject passing the |this|
		// value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal
		// method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== 'function') {
			throw new TypeError(callback + ' is not a function');
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 1) {
			T = thisArg;
		}

		// 6. Let A be a new array created as if by the expression new Array(len)
		// where Array is the standard built-in constructor with that name and
		// len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {

			var kValue, mappedValue;

			// a. Let Pk be ToString(k).
			// This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal
			// method of O with argument Pk.
			// This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal
				// method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal
				// method of callback with T as the this value and argument
				// list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor
				// { Value: mappedValue,
				// Writable: true,
				// Enumerable: true,
				// Configurable: true },
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, k, {
				// value: mappedValue,
				// writable: true,
				// enumerable: true,
				// configurable: true
				// });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

var getInfoFormatado = function(dataset) {

	var fullInfo = []

	for (var i = 0; i < dataset.rowsCount; i++) {

		var obj = {};

		dataset.columnsName.forEach(function(item) {

			try {

				var info = String(dataset.getValue(i, item));
			}

			catch (e) {

				var info = '';
			}

			obj[item] = info
		})

		fullInfo.push(obj)
	}

	return fullInfo
};

function exibeErro(msg, detalhes) {
	// if (detalhes == null || detalhes == '')
	// msg = "Erro desconhecido, verifique o log do servidor."; // se mensagem de erro não foi definida
	log.error('uf-log | msg: ' + msg); // grava log no arquivo 'server.log' do JBOSS
	log.error('uf-log | detalhes: ' + detalhes); // grava log no arquivo 'server.log' do JBOSS
	dataset = DatasetBuilder.newDataset(); // cria um novo DataSet para resposta do erro
	dataset.addColumn("ERRO"); // 1=Erro; 0=Sucesso
	dataset.addColumn("MSG"); // coluna com mensagem do erro
	dataset.addColumn("DETALHES"); // Mensagem detalhada a ser analisada pelo administrador
	dataset.addRow(new Array('1', msg, detalhes)); // cria apenas uma linha com a mensagem de erro
	return dataset; // retorna o erro como resposta do DataSet
}

var uF = {
	log : function(m) {
		log.dir('LOG-UF | ' + m)
	}
}
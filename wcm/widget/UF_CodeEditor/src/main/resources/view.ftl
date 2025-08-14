<#assign reposi='UF_CodeEditor'>
<#assign versao='0.0.1-SNAPSHOT'>
<#assign parametros = "{'DATASOURCE': '${DATASOURCE!}' }">

<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs/jszip-2.5.0/dt-1.10.18/b-1.5.6/b-html5-1.5.6/b-print-1.5.6/datatables.min.css"/>
    
<div  id="${reposi}_${instanceId}" class="uF ${reposi} super-widget wcm-widget-class" 
     data-params="${reposi}.instance({reposi:'${reposi}', versao:'${versao}', widgetId: ${instanceId}, preferences: ${parametros}})">
    
    <div class="block" id="block"></div>
    <div >
        <div class="row" style="
		    height: 100%;">
		    <div class="col-md-10">
			    <div id="cabecalho" class="">
				    <h3>UF SERVER</h3> 
				    <p>Painel para realizar consultas no banco de dados do Fluig.</p>
				   	<i>Obs1.: Você pode selecionar a query que deseja executar.</i> 
				   	<br>
				   	<i>Obs2.: Você pode apertar F10 para executar as consultas.</i> 
				    
				    </div>
			    </div>
		
		</div>
		
		<div class="row" id="containerBtnExecutar">
			<button type="button" id="enviar" title="Executar"><i class="fluigicon fluigicon-play-circle icon-md"></i></button>
		</div>
		   
		    <textarea id="codeEditor" value=""></textarea>
		   
		   <div id="containerTableResult">
		     <table id="tableResult" class="hover">
					<thead></thead>
					<tbody></tbody>
			</table>
		   </div>
    </div>

    
</div>
<script type="text/javascript" src="/webdesk/vcXMLRPC.js"></script>    
<script type="text/javascript" src="https://cdn.datatables.net/v/bs/jszip-2.5.0/dt-1.10.18/b-1.5.6/b-html5-1.5.6/b-print-1.5.6/datatables.min.js">    
<#assign reposi='UF_CodeEditor'>
<#assign versao='0.0.1-SNAPSHOT'>
<#assign parametros = "{'DATASOURCE': '${DATASOURCE!}' }">
    
<div id="${reposi}_${instanceId}" class="uF ${reposi} super-widget wcm-widget-class" 
     data-params="${reposi}.instance({reposi:'${reposi}', versao:'${versao}', widgetId: ${instanceId}, preferences: ${parametros}})">

    <div class = "col-md-12">
    	<label for="DATASOURCE">DATASOURCE</label>
   		<input type="text" class="form-control" placeholder="jdbc/FluigDSRO" name="DATASOURCE" value="${DATASOURCE!}">
   	</div>
   	
    <button type="submit" class="btn btn-primary" id="botaoEnviar" data-save-preferences>SALVAR</button>
   	
    
</div>
    
<script type="text/javascript" src="/${reposi}/resources/js/${reposi}.js?v=${versao}" charset="utf-8"></script>
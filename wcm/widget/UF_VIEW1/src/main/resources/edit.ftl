<#assign reposi='UF_VIEW1'>
<#assign versao='0.0.1_SNAPSHOT'>
<#assign parametros = "{usuAdmin: '${usuAdmin!''}'}">
    
<div id="${reposi}_${instanceId}" class="uF ${reposi} super-widget wcm-widget-class" 
     data-params="${reposi}.instance({reposi:'${reposi}', versao:'${versao}', widgetId: ${instanceId}, preferences: ${parametros}})">

  
        </div>
    </div>

</div>
    
<script type="text/javascript" src="/${reposi}/resources/js/${reposi}.js?v=${versao}" charset="utf-8"></script>
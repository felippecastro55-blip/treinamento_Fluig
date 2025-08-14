<#assign reposi='UF_VIEW1'>
<#assign versao='1.1.0'>
<#assign parametros = "{usuAdmin: '${usuAdmin!''}'}">

<div id="${reposi}_${instanceId}" class="uF ${reposi} super-widget wcm-widget-class"
     data-params="${reposi}.instance({reposi:'${reposi}', versao:'${versao}', widgetId: ${instanceId}, preferences: ${parametros}})">
	
	
	
	<head>
      <meta charset=utf-8>
      <meta name=viewport content="width=device-width,initial-scale=1">
      <title>vertical-time-line</title>
      
   </head>
	
	
	<body class=uF>
      <div id=app></div>
  	</body>
	
	

</div>
    
<!-- FINAL: template para lista de worklog -->
    
<link rel=stylesheet href=https://use.fontawesome.com/releases/v5.4.2/css/all.css integrity=sha384-/rXc/GQVaYpyDdyxK+ecHPVYJSN9bmVFBvjA/9eOB+pb3F2w2N6fc5qB9Ew5yIns crossorigin=anonymous>
<link href=/${reposi}/resources/css/app.f544a0400ddac45f4e951e12295d85e3.css rel=stylesheet>    
<script type="text/javascript" src="/${reposi}/resources/js/${reposi}.js?v=${versao}" charset="utf-8"></script>
<script type=text/javascript src=/${reposi}/resources/js/manifest.2ae2e69a05c33dfc65f8.js></script>
<script type=text/javascript src=/${reposi}/resources/js/vendor.20c7844f11ad3072b68a.js></script>
<script type=text/javascript src=/${reposi}/resources/js/app.7717d1790cb6582f90da.js></script>
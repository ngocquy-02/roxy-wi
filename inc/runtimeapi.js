function showRuntime() {
	if($('#save').prop('checked')) {
		saveCheck = "on";
	} else {
		saveCheck = "";
	}
	$.ajax({
		url: "options.py",
		data: {
			servaction: $('#servaction').val(),
			serv: $("#serv").val(),
			servbackend: $("#servbackend").val(),
			save: saveCheck,
			token: $('#token').val()
		},
		type: "POST",
		success: function (data) {
			$("#ajaxruntime").html(data);
		}
	} );
}
$( function() {
	$('#runtimeapiform').submit(function() {
		showRuntime();
		return false;
	});
	$( "#maxconn_select" ).on('selectmenuchange',function()  {
		let server_ip = $('#maxconn_select').val();
		$.ajax( {
			url: "options.py",
			data: {
				maxconn_select: $('#maxconn_select').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function( data ) {
				data = data.replace(/\s+/g, ' ');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					generate_select(data, '#maxconnfront');
				}
			}
		} );
	});
	$('#maxconnbackend').on('selectmenuchange', function (){
		let server_ip = $('#maxconn_backend_select').val();
		let backend = $('#maxconnbackend').val();
		get_backend_servers(server_ip, backend, '#maxconn_backend_server', 0);
	});
	$( "#maxconn_backend_select" ).on('selectmenuchange',function()  {
		let server_ip = $('#maxconn_backend_select').val();
		get_backends(server_ip, '#maxconnbackend', 0);
	});
	$('#maxconnglobalform').submit(function() {
		$.ajax( {
			url: "options.py",
			data: {
				serv: $('#maxconn_global_select').val(),
				maxconn_global: $('#maxconnintglobal').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function( data ) {
				data = data.replace(/\s+/g, ' ');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					toastr.success(data);
				}
			}
		} );
		return false;
	});
	$('#maxconnform').submit(function() {
		$.ajax( {
			url: "options.py",
			data: {
				serv: $('#maxconn_select').val(),
				maxconn_frontend: $('#maxconnfront').val(),
				maxconn_int: $('#maxconnint').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function( data ) {
				data = data.replace(/\s+/g, ' ');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					toastr.success(data);
				}
			}
		} );
		return false;
	});
	$('#maxconnbackform').submit(function() {
		$.ajax( {
			url: "options.py",
			data: {
				serv: $('#maxconn_backend_select').val(),
				maxconn_backend: $('#maxconnbackend').val(),
				maxconn_backend_server: $('#maxconn_backend_server').val(),
				maxconn_int: $('#maxconn_backend_int').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function( data ) {
				data = data.replace(/\s+/g, ' ');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					toastr.success(data);
				}
			}
		} );
		return false;
	});
	$( "#ip_select" ).on('selectmenuchange',function()  {
		let server_ip = $('#ip_select').val();
		get_backends(server_ip, '#ipbackend', 1);
	});
	$( "#ipbackend" ).on('selectmenuchange',function() {
		let server_ip = $('#ip_select').val();
		let backend = $('#ipbackend').val();
		get_backend_servers(server_ip, backend, '#backend_server', 1);
	});
	$( "#backend_server" ).on('selectmenuchange',function() {
		$('#backend_ip').val();
		$('#backend_port').val();
		$.ajax( {
			url: "options.py",
			data: {
				serv: $('#ip_select').val(),
				ipbackend: $('#ipbackend').val(),
				backend_server: $('#backend_server').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function( data ) {
				data = data.replace(/\s+/g,' ');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					var server = data.split(':')[0]
					var port = data.split(':')[1]
					port = port.replace(/\s+/g,'');
					server = server.replace(/\s+/g,'');
					$('#backend_port').val(port);
					$('#backend_ip').val(server);			
				}	
			}
		} );	
	});
	$('#runtimeapiip').submit(function() {
		$.ajax({
			url: "options.py",
			data: {
				serv: $('#ip_select').val(),
				backend_backend: $('#ipbackend').val(),
				backend_server: $('#backend_server').val(),
				backend_ip: $('#backend_ip').val(),
				backend_port: $('#backend_port').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function (data) {
				data = data.replace(/\s+/g, ' ');
				if (data.indexOf('error: ') != '-1' || data.indexOf('Invalid ') != '-1') {
					toastr.error(data);
				} else {
					toastr.success(data);
				}
			}
		} );
		return false;
	});
	$( "#table_serv_select" ).on('selectmenuchange',function() {
		$.ajax( {
			url: "options.py",
			data: {
				serv: $('#table_serv_select').val(),
				table_serv_select: $('#table_serv_select').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function( data ) {
				data = data.replace(/\s+/g,'');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					generate_select(data, '#table_select', 'All', ',');
				}
			}
		} );
	});
	$('#runtimeapitable').submit(function() {
		getTable();
		return false;
	});
	$('#runtimeapilist').submit(function() {
		getList();
		return false;
	});
	$('#runtimeapisessions').submit(function() {
		getSessions();
		return false;
	});
	$( "#list_serv_select" ).on('selectmenuchange',function() {
		$.ajax({
			url: "options.py",
			data: {
				serv: $('#list_serv_select').val(),
				list_serv_select: $('#list_serv_select').val(),
				token: $('#token').val()
			},
			type: "POST",
			success: function (data) {
				data = data.replace(/, /g, ',');
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					var value = data.split(',');
					$('#list_select').find('option').remove();

					for (let i = 0; i < data.split(',').length; i++) {
						if (value[i] != '') {
							value[i] = value[i].replace(/\'/g, '');
							value[i] = value[i].replace('(', '');
							value[i] = value[i].replace(')', '');
							value[i] = value[i].replace('[', '');
							value[i] = value[i].replace(']', '');
							id = value[i].split(' ')[0];
							full_text_option = value[i].split(' ')[1]
							text_option = full_text_option.split('/').slice(-2)[0];
							text_option = text_option + '/' + full_text_option.split('/').slice(-1)[0];
							$('#list_select').append($("<option title=\"Show list " + text_option + "\"></option>")
								.attr("value", id)
								.text(text_option));
						}
					}
					$('#list_select').selectmenu("refresh");
				}
			}
		} );
	});
});
function deleteTableEntry(id, table, ip) {
	$(id).parent().parent().css("background-color", "#f2dede");
	$.ajax( {
    	url: "options.py",
    	data: {
    	    serv: $('#table_serv_select').val(),
    		table_for_delete: table,
    		ip_for_delete: ip,
    		token: $('#token').val()
    	},
    	type: "POST",
    	success: function( data ) {
    	    if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
    		} else {
    		    $(id).parent().parent().remove()
    		}
    	}
    } );
}
function clearTable(table) {
	$.ajax( {
		url: "options.py",
		data: {
			serv: $('#table_serv_select').val(),
			table_for_clear: table,
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				getTable();
			}
		}
	} );
}
function getTable() {
	$.ajax( {
		url: "options.py",
		data: {
			serv: $('#table_serv_select').val(),
			table_select: $('#table_select').val(),
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('error:') != '-1') {
				toastr.error(data);
			} else {
				$("#ajaxtable").html(data);
				$( "input[type=submit], button" ).button();
				$.getScript("/inc/script-6.3.9.js");
				$.getScript("/inc/fontawesome.min.js");
				FontAwesomeConfig = { searchPseudoElements: true, observeMutations: false };
			}
		}
	} );
}
function getList() {
	$.ajax( {
		url: "options.py",
		data: {
			serv: $('#list_serv_select').val(),
			list_select_id: $('#list_select').val(),
			list_select_name: $('#list_select  option:selected').text(),
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				$("#ajaxlist").html(data);
				$( "input[type=submit], button" ).button();
				$.getScript("/inc/script-6.3.9.js");
				$.getScript("/inc/fontawesome.min.js");
				FontAwesomeConfig = { searchPseudoElements: true, observeMutations: false };
			}
		}
	} );
}
function deleteListIp(id, list_id, ip_id, ip) {
	toastr.clear();
	$(id).parent().parent().css("background-color", "#f2dede !important");
	$.ajax( {
		url: "options.py",
		data: {
			serv: $('#list_serv_select').val(),
			list_id_for_delete: list_id,
			list_ip_id_for_delete: ip_id,
			list_ip_for_delete: ip,
			list_name: $('#list_add_ip').data("list-name"),
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				$(id).parent().parent().remove();
				toastr.info('Do not forget upload updated list to the properly server. Restart does not need');
				getList();
			}
		}
	} );
}
function addNewIp() {
	toastr.clear();
	var valid = true;
	allFields = $( [] ).add( $('#list_add_ip_new_ip') );
	allFields.removeClass( "ui-state-error" );
	valid = valid && checkLength( $('#list_add_ip_new_ip'), "IP", 1 );
	var ip = $('#list_add_ip_new_ip').val();
	if(valid) {
		$.ajax({
			url: "options.py",
			data: {
				serv: $('#list_serv_select').val(),
				list_ip_for_add: ip,
				list_id_for_add: $('#list_add_ip').data("list-id"),
				list_name: $('#list_add_ip').data("list-name"),
				token: $('#token').val()
			},
			type: "POST",
			success: function (data) {
				if (data.indexOf('error: ') != '-1') {
					toastr.error(data);
				} else {
					getList();
					$( "#list_add_ip_form" ).dialog("destroy" );
					toastr.success('IP ' + ip + ' has been added');
					toastr.info('Do not forget upload updated list to the properly server. Restart does not need');
				}
			}
		});
	}
}
function getSessions() {
	$.ajax( {
		url: "options.py",
		data: {
			sessions_select: $('#sessions_serv_select').val(),
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				$("#ajaxsessions").html(data);
				$( "input[type=submit], button" ).button();
				$.getScript("/inc/script-6.3.9.js");
				$.getScript("/inc/fontawesome.min.js");
				FontAwesomeConfig = { searchPseudoElements: true, observeMutations: false };
			}
		}
	} );
}
function getSessionInfo(sess_id) {
	$.ajax( {
		url: "options.py",
		data: {
			sessions_select_show: $('#sessions_serv_select').val(),
			sessions_select_id: sess_id,
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('danger') != '-1') {
				toastr.error(data);
			} else {
				toastr.clear();
				$("#get-session-info-body").html(data);
				$( "#get-session-info" ).dialog({
					resizable: false,
					height: "auto",
					width: 790,
					modal: true,
					title: "View session",
					buttons: {
						Close: function() {
							$( this ).dialog( "close" );
							$("#get-session-info-body").html('');
						}
					}
				});
			}
		}
	} );
}
function deleteSession(id, sess_id) {
	toastr.clear();
	$(id).parent().parent().css("background-color", "#f2dede !important");
	$.ajax( {
		url: "options.py",
		data: {
			serv: $('#sessions_serv_select').val(),
			session_delete_id: sess_id,
			token: $('#token').val()
		},
		type: "POST",
		success: function( data ) {
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				$(id).parent().parent().remove();
				toastr.success('The sessions has been deleted');
				getSessions();
			}
		}
	} );
}
function get_backends(server_ip, backends_select_tag, ip_and_port=0) {
	$.ajax({
		url: "options.py",
		data: {
			ip_select: 1,
			serv: server_ip,
			token: $('#token').val()
		},
		type: "POST",
		success: function (data) {
			data = data.replace(/\s+/g, ' ');
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				generate_select(data, backends_select_tag);
				if (ip_and_port == 1) {
					$('#backend_server').find('option').remove();
					$('#backend_server').selectmenu("refresh");
					$('#backend_port').val('');
					$('#backend_ip').val('');
				}
			}
		}
	} );
}
function get_backend_servers(server_ip, backend, servers_select_tag, ip_and_port=0) {
	$.ajax({
		url: "options.py",
		data: {
			serv: server_ip,
			ipbackend: backend,
			token: $('#token').val()
		},
		type: "POST",
		success: function (data) {
			data = data.replace(/\s+/g, ' ');
			if (data.indexOf('error: ') != '-1') {
				toastr.error(data);
			} else {
				generate_select(data, servers_select_tag);
				if (ip_and_port == 1) {
					$('#backend_port').val('');
					$('#backend_ip').val('');
				}
			}
		}
	} );
}
function generate_select(values, select_tag, custom_value=0, separator='<br>') {
	var value = values.split(separator)
	$(select_tag).find('option').remove();
	$(select_tag).append($("<option></option>").attr("value", "disabled").text("------"));
	if (custom_value) {
		$(select_tag).append($("<option></option>").attr("value", custom_value).text(custom_value));
	}
	for (let i = 0; i < values.split(separator).length; i++) {
		if (value[i] != ' ' && value[i] != '' ) {
			value[i] = value[i].replace(/\s+/g, '');
			$(select_tag).append($("<option></option>")
				.attr("value", value[i])
				.text(value[i]));
		}
	}
	$(select_tag).selectmenu("refresh");
}

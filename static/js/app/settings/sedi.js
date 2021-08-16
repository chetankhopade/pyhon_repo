let tableSettingsEDI = $("#tableSettingsEDI");
let dtSettingsEDI = '';

let SETTINGS_EDI = {

    name: 'SETTINGS_EDI',

    update_all_outbound_folder: function (value, dcid) {

        $.ajax({
            url: `/${DB_NAME}/settings/all_outbound_folder`,
            type: "POST",
            data: {
                'value': value,
                'dcid': dcid
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            },
            success: function (response) {
                if (response.result === 'ok'){
                    show_toast_success_message(response.message, 'bottomRight');
                }else{
                    show_toast_error_message(response.message);
                }
            },
            error: function () {
                show_toast_error_message('Internal Error');
            }
        });
    },

    load_data: function () {

        if (dtSettingsEDI !== undefined && dtSettingsEDI !== '') {
            dtSettingsEDI.destroy();
        }

        dtSettingsEDI = tableSettingsEDI.DataTable({
            lengthMenu:     [[50, 100, 200, -1], [50, 100, 200, "All"]],
            scrollY:        '55vh',
            dom: "<'row'<'col-sm-4'l><'col-sm-4'i><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'><'col-sm-7'p>>",
            processing:     true,
            serverSide:     true,
            autoWidth:      false,
            order:          [[0, 'desc']],
            language : {
                search:             "",
                searchPlaceholder:  "Search ...",
                processing:         SPINNER_LOADER,
                infoFiltered:       "",
            },
            ajax: {
                url:    `/${DB_NAME}/customers/direct/load_data`,
                type:   'POST',
            },
            initComplete: function() {
                let $searchInput = $('#tableSettingsEDI_filter input');
                $searchInput.unbind();
                $searchInput.bind('keyup', function(e) {
                    if(this.value.length === 0 || this.value.length >= 3) {
                        dtSettingsEDI.search( this.value ).draw();
                    }
                });
            },
            // add datepicker dynamically to dt
            fnDrawCallback: function() {
                // btn Update toggle option
                $(".btnUpdateEDIOption").click(function () {
                    let elem = $(this);
                    let option = elem.attr('option');
                    let dcid = elem.attr('dcid');
                    SETTINGS.update_edi_option(elem, option, dcid );
                });
                // ticket 1382 - create/update all outbound folder
                $(".inputAllOutboundFolder").blur(function () {
                    let elem = $(this);
                    let dcid = elem.attr('dcid');
                    let value = elem.val();
                    SETTINGS_EDI.update_all_outbound_folder(value, dcid );
                });
            },
            columns: [
                {
                    data: 'name',
                    render : function(data, type, row) {
                        return '<span db="'+DB_NAME+'" target="/customers/direct/'+row["id"]+'/details/info">' +
                            '<a onclick="APP.execute_url($(this))" class="empower-color-blue">' + data + '</a>' +
                            '</span>'
                    }
                },
                {
                    data: 'enabled_844',
                    class: 'text-center',
                    render : function(data, type, row) {
                        let html = '';
                        if (data){
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="844_enabled" dcid="'+row["id"]+'" checked/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }else {
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="844_enabled" dcid="'+row["id"]+'"/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }
                        return html;
                    }
                },
                {
                    data: 'enabled_849',
                    class: 'text-center',
                    render : function(data, type, row) {
                        let html = '';
                        if (data){
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="849_enabled" dcid="'+row["id"]+'" checked/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }else {
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="849_enabled" dcid="'+row["id"]+'"/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }
                        return html;
                    }
                },
                {
                    data: 'enabled_852',
                    class: 'text-center',
                    render : function(data, type, row) {
                        let html = '';
                        if (data){
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="852_enabled" dcid="'+row["id"]+'" checked/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }else {
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="852_enabled" dcid="'+row["id"]+'"/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }
                        return html;
                    }
                },
                {
                    data: 'enabled_867',
                    class: 'text-center',
                    render : function(data, type, row) {
                        let html = '';
                        if (data){
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="867_enabled" dcid="'+row["id"]+'" checked/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }else {
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="867_enabled" dcid="'+row["id"]+'"/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }
                        return html;
                    }
                },
                {
                    data: 'nocredit',
                    class: 'text-center',
                    render : function(data, type, row) {
                        let html = '';
                        if (data){
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="nocredit" dcid="'+row["id"]+'" checked/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }else {
                            html = '<label class="switch">' +
                                '<input type="checkbox" class="btnUpdateEDIOption" option="nocredit" dcid="'+row["id"]+'"/>' +
                                '<span class="slider round"></span>' +
                                '</label>'
                        }
                        return html;
                    }
                },
                {
                    data: 'all_outbound_folder',
                    class: 'text-center',
                    render : function(data, type, row) {
                        let html = '';
                        if (IS_ADMIN === 'True'){
                            html = '<input type="text" class="inputAllOutboundFolder form-control width-90" dcid="'+row["id"]+'" value="'+data+'">';
                        }else{
                            html = '<span>'+data+'</span>'
                        }
                        return html
                    }
                },
            ],
        });
    },

};


$(function () {

});


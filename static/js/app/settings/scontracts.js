// elements
let modalCompanySettingsEnableCoT = $("#modalCompanySettingsEnableCoT");
let modalCompanySettingsCoTManager = $("#modalCompanySettingsCoTManager");

let checkboxCotEnabled = $("#checkboxCotEnabled");
let divCompanySettingsCotManagerWithoutRecords = $("#divCompanySettingsCotManagerWithoutRecords");
let divCompanySettingsCotManagerWithRecords = $("#divCompanySettingsCotManagerWithRecords");

let divAddCoTContainer = $("#divAddCoTContainer");
let modalCompanySettingsCoTManagerAddItem = $("#modalCompanySettingsCoTManagerAddItem");

let tableCompanySettingsCotManager = $("#tableCompanySettingsCotManager");
let dtCompanySettingsCotManager;


let SETTINGS_CONTRACTS = {

    name: 'SETTINGS_CONTRACTS',

    has_cots: COMPANY_HAS_COT,

    new_cots_items: [],

    // toggle enable CoT - show modal
    show_modal_when_cot_enabled: function () {
        modalCompanySettingsEnableCoT.modal('show');
    },

    cancel_from_cot_enabled_modal: function () {
        checkboxCotEnabled.prop('checked', false);
        SETTINGS.update_option(checkboxCotEnabled, 'class_of_trade_validation_enabled');
        modalCompanySettingsEnableCoT.modal('hide');
    },

    copy_from_master_cot_enabled_modal: function (elem) {
        let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Copying...';
        let originalText = elem.html();
        $.ajax({
            url: `/${DB_NAME}/settings/cots/copy_from_master`,
            type: "POST",
            data: {},
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
                elem.addClass('disabled').html(loadingText);
            },
            success: function (response) {
                if (response.result === 'ok'){
                    modalCompanySettingsEnableCoT.modal('hide');
                    show_toast_success_message(response.message, 'bottomRight');
                    SETTINGS_CONTRACTS.has_cots = 'true';
                }else{
                    show_toast_error_message(response.message);
                }
            },
            complete: function () {
                elem.removeClass('disabled').html(originalText);
            },
            error: function () {
                elem.removeClass('disabled').html(originalText);
                show_toast_error_message('Internal Error');
            }
        });
    },

    // Cot Manager - load data
    load_data: function () {
        if (dtCompanySettingsCotManager !== undefined && dtCompanySettingsCotManager !== '') {
            dtCompanySettingsCotManager.destroy();
        }
        dtCompanySettingsCotManager = tableCompanySettingsCotManager.DataTable({
            lengthMenu:     [[-1], ["All"]],
            scrollY:        '40vh',
            processing:     true,
            responsive:     true,
            info:           false,
            order:          [[1, 'asc']],
            language : {
                search:             "",
                searchPlaceholder:  "Search ...",
                loadingRecords:     "",
                processing:         SPINNER_LOADER,
            },
            // add datepicker dynamically to dt
            fnDrawCallback: function() {
                // remove CoT
                $(".btnRemoveCoT").click(function () {
                    let elem = $(this);
                    let cotid = elem.attr('cotid');
                    let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Removing...';
                    let originalText = elem.html();
                    $.ajax({
                        url: `/${DB_NAME}/settings/cots/${cotid}/remove`,
                        type: "POST",
                        data: {},
                        beforeSend: function(xhr, settings) {
                            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                            }
                            elem.addClass('disabled').html(loadingText);
                        },
                        success: function (response) {
                            if (response.result === 'ok'){
                                show_toast_success_message(response.message, 'bottomRight');
                                SETTINGS_CONTRACTS.load_data();
                            }else{
                                show_toast_error_message(response.message);
                            }
                        },
                        complete: function () {
                            elem.removeClass('disabled').html(originalText);
                        },
                        error: function () {
                            elem.removeClass('disabled').html(originalText);
                            show_toast_error_message('Internal Error');
                        }
                    });
                });

            },
            ajax: {
                url:    `/${DB_NAME}/settings/cots/load_data`,
                type:   'POST',
                data: {}
            },
            initComplete: function() {
                let $searchInput = $('#tableCompanySettingsCotManager_filter input');
                $searchInput.unbind();
                $searchInput.bind('keyup', function(e) {
                    if(this.value.length === 0 || this.value.length >= 3) {
                        dtCompanySettingsCotManager.search( this.value ).draw();
                    }
                });
            },
            columnDefs: [
                {
                    "targets": [0],
                    "visible": false,
                    "searchable": false,
                    "orderable": false,
                },
                {
                    "targets": [3,4],
                    "searchable": false,
                    "orderable": false,
                }
            ],
            columns: [
                {data: 'id'},
                {
                    data: 'name',
                    orderDataType: "dom-text",
                    type: 'string',
                    render : function(data, type, row) {
                        return  '<div class="form-group m-1">' +
                                    '<input type="text" class="inputCoTName form-control font-12" value="'+data+'"/>' +
                                '</div>';
                    }
                },
                {
                    data: 'description',
                    orderDataType: "dom-text",
                    type: 'string',
                    render : function(data, type, row) {
                        return  '<div class="form-group m-1">' +
                                    '<input type="text" class="inputCoTDescription form-control font-12" value="'+data+'"/>' +
                                '</div>';
                    }
                },
                {
                    data: '',
                    class: 'text-center',
                    render : function(data, type, row) {
                        if (row['is_active'] === 'true'){
                            return  '<label class="md-check">' +
                                        '<input type="checkbox" class="checkboxCoTEnabled" checked />' +
                                        '<i class="blue"></i>' +
                                    '</label>'
                        }else{
                            return  '<label class="md-check">' +
                                        '<input type="checkbox" class="checkboxCoTEnabled" />' +
                                        '<i class="blue"></i>' +
                                    '</label>'
                        }
                    }
                },
                {
                    data: '',
                    class: 'text-center',
                    render : function(data, type, row) {
                        return '<div class="dropleft">' +
                                    '<a href="#" id="dropdownRemoveCoT" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                        '<i class="fas fa-trash"></i>' +
                                    '</a>' +
                                    '<div class="dropdown-menu" aria-labelledby="dropdownRemoveCoT">' +
                                        '<div class="dropdown-item">' +
                                            'Are you sure you want to delete this entry: <span class="_700">' + row["name"] + '?</span>' +
                                        '</div>' +
                                        '<div class="dropdown-item">' +
                                            '<a cotid="'+row["id"]+'" class="btn btn-warning btn-sm width-80px btnRemoveCoT"> Yes</a>' +
                                            '<a class="btn btn-primary btn-sm ml-2 width-80px">No</a>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';
                    }
                },
            ],
        });
        $('#tableCompanySettingsCotManager_paginate').css("display", "none");
        // $('#tableCompanySettingsCotManager_length').css("display", "none");
        $('#tableCompanySettingsCotManager_length').html(
            '<a class="btn btn-warning" data-toggle="modal" data-target="#modalCompanySettingsCoTManagerAddItem">' +
                    '<i class="fa fa-plus font-9"></i> ' +
                    '<span class="font-11">Add Item</span>' +
                  '</a>');
    },

    save: function (elem) {
        let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Saving...';
        let originalText = elem.html();

        let cots = [];
        $('#tableCompanySettingsCotManager > tbody  > tr').each(function() {
            let cotID = $(this).attr('id');
            let cotName = $(this).find('.inputCoTName').val();
            let cotDescription = $(this).find('.inputCoTDescription').val();
            let cotEnabled = 1 ? $(this).find('.checkboxCoTEnabled').is(':checked') : 0;

            if (cotName) {
                cots.push({
                    "id": cotID,
                    "name": cotName,
                    "description": cotDescription,
                    "enabled": cotEnabled,
                });
            }
        });

        $.ajax({
            url: `/${DB_NAME}/settings/cots/save`,
            type: "POST",
            data: {
                "cots": JSON.stringify(cots)
            },
            dataType: "json",
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
                elem.addClass('disabled').html(loadingText);
            },
            success: function (response) {
                if(response.result === 'ok') {
                    modalCompanySettingsCoTManager.modal('hide');
                    show_toast_success_message(response.message, 'bottomRight');
                }else{
                    show_toast_error_message(response.message, 'bottomRight');
                }
            },
            complete: function () {
                elem.removeClass('disabled').html(originalText);
            },
            error: function () {
                elem.removeClass('disabled').html(originalText);
                show_toast_error_message('Internal Error');
            }
        });
    },

    // Add Item (update color in inputs)
    update_input_border_color: function (elem) {
        if (elem.val() && elem.val() !== undefined && elem.val() !== ' '){
            elem.removeClass('border-red');
            elem.addClass('border-green');
        }else{
            elem.removeClass('border-green');
            elem.addClass('border-red');
        }
    },

    remove_new_item_inputs: function (index) {
        if (SETTINGS_CONTRACTS.new_cots_items.length === 0){
            show_toast_warning_message('At least one row is required')
        }else{
            SETTINGS_CONTRACTS.new_cots_items.splice(index, 1);
            SETTINGS_CONTRACTS.update_new_cot_items();
        }
    },

    update_new_cot_items: function() {

        divAddCoTContainer.empty();

        if (SETTINGS_CONTRACTS.new_cots_items.length === 0){
            divAddCoTContainer.append(
                '<div class="row my-2" index="0">' +
                    '<div class="col-5">' +
                        '<input type="text" class="inputCoTNameAddItem form-control font-12" onblur="SETTINGS_CONTRACTS.update_input_border_color($(this))" value=""/>' +
                    '</div>' +
                    '<div class="col-6">' +
                        '<input type="text" class="inputCoTDescriptionAddItem form-control font-12" onblur="SETTINGS_CONTRACTS.add_new_item_inputs($(this))" value=""/>' +
                    '</div>' +
                    '<div class="col">' +
                        '<a onclick="SETTINGS_CONTRACTS.remove_new_item_inputs($(this));" index="0">' +
                            '<i class="fa fa-times text-danger"></i>' +
                        '</a>' +
                    '</div>' +
                '</div>'
            );

        }else{
            for (let i in SETTINGS_CONTRACTS.new_cots_items) {
                let item = SETTINGS_CONTRACTS.new_cots_items[i];
                divAddCoTContainer.append(
                    '<div class="row my-2" index="'+i+'">' +
                        '<div class="col-5">' +
                            '<input type="text" class="inputCoTNameAddItem form-control font-12" onblur="SETTINGS_CONTRACTS.update_input_border_color($(this))" value="'+item["name"]+'"/>' +
                        '</div>' +
                        '<div class="col-6">' +
                            '<input type="text" class="inputCoTDescriptionAddItem form-control font-12" onblur="SETTINGS_CONTRACTS.add_new_item_inputs($(this))" value="'+item["description"]+'"/>' +
                        '</div>' +
                        '<div class="col">' +
                            '<a onclick="SETTINGS_CONTRACTS.remove_new_item_inputs($(this));" index="'+i+'">' +
                                '<i class="fa fa-times text-danger"></i>' +
                            '</a>' +
                        '</div>' +
                    '</div>'
                );
            }
            let index = SETTINGS_CONTRACTS.new_cots_items.length;
            divAddCoTContainer.append(
                '<div class="row my-2" index="'+index+'">' +
                    '<div class="col-5">' +
                        '<input type="text" class="inputCoTNameAddItem form-control font-12" onblur="SETTINGS_CONTRACTS.update_input_border_color($(this))" value=""/>' +
                    '</div>' +
                    '<div class="col-6">' +
                        '<input type="text" class="inputCoTDescriptionAddItem form-control font-12" onblur="SETTINGS_CONTRACTS.add_new_item_inputs($(this))" value=""/>' +
                    '</div>' +
                    '<div class="col">' +
                        '<a onclick="SETTINGS_CONTRACTS.remove_new_item_inputs($(this));" index="'+index+'">' +
                            '<i class="fa fa-times text-danger"></i>' +
                        '</a>' +
                    '</div>' +
                '</div>'
            );

        }
    },

    add_new_item_inputs: function (elem) {
        SETTINGS_CONTRACTS.update_input_border_color(elem);
        let rowParent = elem.parent().parent();
        let inputCoTName = rowParent.find('.inputCoTNameAddItem');
        if (elem.val() && elem.val() !== undefined && inputCoTName.val() && inputCoTName.val() !== undefined){
            SETTINGS_CONTRACTS.new_cots_items.push({
                name: inputCoTName.val(),
                description: elem.val(),
            });
            SETTINGS_CONTRACTS.update_new_cot_items();
        }
    },

    add_new_cots: function () {
        if (SETTINGS_CONTRACTS.new_cots_items.length !== 0){
            $.ajax({
                url: `/${DB_NAME}/settings/cots/add_new_cots`,
                type: "POST",
                data: {
                    "cots": JSON.stringify(SETTINGS_CONTRACTS.new_cots_items)
                },
                dataType: "json",
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {
                    if(response.result === 'ok') {
                        modalCompanySettingsCoTManagerAddItem.modal('hide');
                        divCompanySettingsCotManagerWithoutRecords.hide();
                        divCompanySettingsCotManagerWithRecords.fadeIn(200);
                        SETTINGS_CONTRACTS.has_cots = 'true';
                        SETTINGS_CONTRACTS.load_data();
                        show_toast_success_message(response.message, 'bottomRight');
                    }else{
                        show_toast_error_message(response.message, 'topCenter');
                    }
                },
            });

        }
    }

};

$(function (){

    /* Create an array with the values of all the input boxes in a column */
    // https://datatables.net/examples/plug-ins/dom_sort.html
    $.fn.dataTable.ext.order['dom-text'] = function (settings, col){
        return this.api().column( col, {order:'index'} ).nodes().map( function (td, i) {
            return $('input', td).val();
        });
    };

    modalCompanySettingsCoTManager.on('shown.bs.modal', function (e) {
        if (SETTINGS_CONTRACTS.has_cots === 'true' ){
            divCompanySettingsCotManagerWithRecords.show();
            divCompanySettingsCotManagerWithoutRecords.hide();
            // initialize and load data in dtable when modal opens
            SETTINGS_CONTRACTS.load_data();
        }else{
            divCompanySettingsCotManagerWithRecords.hide();
            divCompanySettingsCotManagerWithoutRecords.show();
            modalCompanySettingsCoTManager.find('.modal-body').html()
        }
    });

    // Add Item Cot
    modalCompanySettingsCoTManagerAddItem.on('shown.bs.modal', function (e) {
        // initialize empty values when modal opens
        $(".inputCoTNameAddItem").val('');
        $(".inputCoTDescriptionAddItem").val('');
        SETTINGS_CONTRACTS.new_cots_items = [];
        SETTINGS_CONTRACTS.update_new_cot_items();
    });

});

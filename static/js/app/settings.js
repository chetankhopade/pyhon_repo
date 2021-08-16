// checkboxes
const checkboxes_membership_validation_enable = $('[name="membership_validation_enable"]');
const checkboxes_proactive_membership_validation = $('[name="proactive_membership_validation"]');
const checkboxes_select_proactive_membership_validation = $("#select_proactive_membership_validation");

let SETTINGS = {

    name: 'SETTINGS',
    enable_option: function (elem, opt) {
        $("#expired_cb_threshold").hide();
        if (elem.is(':checked')) {
           $("#expired_cb_threshold").show();
        }else{

        }
    },
    update_option: function (elem, opt) {
        // Ticket EA-720 make this options dependent of Automatic Chargeback Processing
        let inputAutomateImport = $('#inputAutomateImport');
        let inputQuickbooksAPIIntegration = $('#inputQuickbooksAPIIntegration');
        // ticket 1111
        let inputMembershipValidationEnable = $("#inputMembershipValidationEnable");
        let value = 0;
        if (elem.is(':checked')){
            value = 1;
        }
        // EA-1576 Add a company setting to set the start page
         if(opt == "chargeback_start_page"){
            value = $("#selectCbStartPage").val();
        }
        $.ajax({
            url: `/${DB_NAME}/settings`,
            type: "POST",
            data: {
                'opt': opt,
                'value': value
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            },
            success: function (response) {
                if (response.result === 'ok'){

                    // Specific Ticket EA-720 enable or disable dependent options
                    if (opt === 'automatic_chargeback_processing'){
                        if (value === 1){
                            inputAutomateImport.prop('checked', true);
                            inputQuickbooksAPIIntegration.prop('checked', true);
                        }else{
                            inputAutomateImport.prop('checked', false);
                            inputQuickbooksAPIIntegration.prop('checked', false);
                        }
                        SETTINGS.update_option(inputAutomateImport, 'automate_import');
                        SETTINGS.update_option(inputQuickbooksAPIIntegration, 'quickbooks_api_integration');
                    }
                    // Specific for Ticket 502 (CoT)
                    if (opt === 'class_of_trade_validation_enabled' && value === 1 && COMPANY_HAS_COT === 'false'){
                        SETTINGS_CONTRACTS.show_modal_when_cot_enabled();
                    }
                    // specific for ticket 1111
                    if (opt === 'proactive_membership_validation' && value === 1){
                        inputMembershipValidationEnable.prop('checked', true);
                    }

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
    update_cb_threshold_option: function (elem, opt,flag1,flag2) {

            let value = 0;
            if (elem.is(':checked')) {
                value = 1;
                if($('#expired_cb_threshold').val()== "None"){
                    $('#expired_cb_threshold').val('');
                }
                $('#expired_cb_threshold').show();

            }
            let expired_cb_threshold = '';
            if (value == 0) {
                if($('#expired_cb_threshold').val()== "None"){
                    $('#expired_cb_threshold').val('');
                }
                $('#expired_cb_threshold').hide();
            }
            expired_cb_threshold = $('#expired_cb_threshold').val();
            $.ajax({
            url: `/${DB_NAME}/settings`,
            type: "POST",
            data: {
                'opt': opt,
                'value': value,
                'expired_cb_threshold': expired_cb_threshold
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
    update_cb_threshold_value_option: function (elem, opt,flag1,flag2) {

            let expired_cb_threshold = $('#expired_cb_threshold').val();
            let value = 1;
            $.ajax({
            url: `/${DB_NAME}/settings`,
            type: "POST",
            data: {
                'opt': opt,
                'value': value,
                'expired_cb_threshold': expired_cb_threshold
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
                    $('#expired_cb_threshold').val('');
                    show_toast_error_message(response.message);
                }
            },
            error: function () {
                show_toast_error_message('Internal Error');
            }
        });
    },
    update_edi_option: function (elem, opt, dcid) {

        let value = 0;
        if (elem.is(':checked')){
            value = 1;
        }
        $.ajax({
            url: `/${DB_NAME}/settings/update_edi_option`,
            type: "POST",
            data: {
                'opt': opt,
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

    disableProactiveMembershipValidation: function (){
        checkboxes_proactive_membership_validation.addClass('btn-default');
        checkboxes_proactive_membership_validation.removeClass('btn-warning');
        checkboxes_select_proactive_membership_validation.addClass('invisible');
    },
    enableProactiveMembershipValidation: function (){
        checkboxes_proactive_membership_validation.addClass('btn-default');
        checkboxes_proactive_membership_validation.removeClass('btn-warning');
        checkboxes_select_proactive_membership_validation.removeClass('invisible');
    },
    update_contract_threshold_option: function (elem, opt,flag1,flag2) {

            let value = 0;
            if (elem.is(':checked')) {
                value = 1

                if($('#expire_notification_contract_threshold').val()== ""){
                    $('#expire_notification_contract_threshold').val("");
                }
                $("#contract_threshold").show();

            }
            let expire_notification_contract_threshold = '';
            if (value == 0) {
                if($('#expire_notification_contract_threshold').val()== "None"){
                    $('#expire_notification_contract_threshold').val('');
                }
                // $('#expire_notification_contract_threshold').hide();
                $("#contract_threshold").hide();
            }
            expire_notification_contract_threshold = $('#expire_notification_contract_threshold').val();
            $.ajax({
            url: `/${DB_NAME}/settings`,
            type: "POST",
            data: {
                'opt': opt,
                'value': value,
                'expire_notification_contract_threshold': expire_notification_contract_threshold
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
    update_contract_threshold_value_option: function (elem, opt,flag1,flag2) {

            let expire_notification_contract_threshold = $('#expire_notification_contract_threshold').val();
            let value = 1;
            $.ajax({
            url: `/${DB_NAME}/settings`,
            type: "POST",
            data: {
                'opt': opt,
                'value': value,
                'expire_notification_contract_threshold': expire_notification_contract_threshold
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
                    $('#expired_cb_threshold').val('');
                    show_toast_error_message(response.message);
                }
            },
            error: function () {
                show_toast_error_message('Internal Error');
            }
        });
    },
};

$(function (){

    checkboxes_membership_validation_enable.change(function(){
        if ($(this).is(':checked')){
            SETTINGS.enableProactiveMembershipValidation();
        } else {
            SETTINGS.disableProactiveMembershipValidation();
        }
    });

    if (checkboxes_membership_validation_enable.is(':checked')){
        SETTINGS.enableProactiveMembershipValidation();
    } else {
        SETTINGS.disableProactiveMembershipValidation();
    }

    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
        let target = $(e.target).attr("data-target").replace(/#/g, ""); // activated tab
        if (target === 'tabEDIs'){
            // load datatable
            SETTINGS_EDI.load_data();
        }
    });

});

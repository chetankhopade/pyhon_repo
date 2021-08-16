// elems
let btnShowModalIntegrationConfig = $("#btnShowModalIntegrationConfig");
let selectAccountingIntegrations = $("#selectAccountingIntegrations");
let ai_password = $("#ai_password");
let ds365_client_secret = $("#ds365_client_secret");

// modals
let modalAccountingIntegrationConfigurationData = $("#modalAccountingIntegrationConfigurationData");
let modalAccountingIntegrationChange = $("#modalAccountingIntegrationChange");

// forms
let fmAccountingIntegrationConfigurationDataAC = $("#fmAccountingIntegrationConfigurationDataAC");
let fmAccountingIntegrationConfigurationDataQB = $("#fmAccountingIntegrationConfigurationDataQB");
let fmAccountingIntegrationConfigurationDataDS365 = $("#fmAccountingIntegrationConfigurationDataDS365");


let SETTINGS_CHARGEBACKS = {

    name: 'SETTINGS_CHARGEBACKS',

    // show or hide password (for password fields)
    show_hide_password: function (elem) {
        let type = '';

        // accumatica
        if (elem === 'ai_password') {
            type = ai_password.attr('type');
            if (type === "password") {
                ai_password.attr('type', 'text');
            } else {
                ai_password.attr('type', 'password');
            }
        }

        // dynamics365
        if (elem === 'ds365_client_secret') {
            type = ds365_client_secret.attr('type');
            if (type === "password") {
                ds365_client_secret.attr('type', 'text');
            } else {
                ds365_client_secret.attr('type', 'password');
            }
        }

    },

    // Show modal Acumatica Config data
    show_modal_accounting_integration_config: function () {
        let integration_system_id = selectAccountingIntegrations.val();
        if (integration_system_id === INTEGRATION_SYSTEM_ACUMATICA_ID){
            fmAccountingIntegrationConfigurationDataAC.show();
            fmAccountingIntegrationConfigurationDataQB.hide();
            fmAccountingIntegrationConfigurationDataDS365.hide();
        } else if (integration_system_id === INTEGRATION_SYSTEM_DYNAMICS365_ID){
            fmAccountingIntegrationConfigurationDataDS365.show();
            fmAccountingIntegrationConfigurationDataAC.hide();
            fmAccountingIntegrationConfigurationDataQB.hide();
        }else{
            fmAccountingIntegrationConfigurationDataQB.show();
            fmAccountingIntegrationConfigurationDataAC.hide();
            fmAccountingIntegrationConfigurationDataDS365.hide();
        }
        modalAccountingIntegrationConfigurationData.modal('show');
    },

    update_accounting_configuration: function (elem) {
        let integration_system_id = selectAccountingIntegrations.val();
        let dataOK = true;

        // accumatica
        let base_url = $("#ai_base_url").val();
        let username = $("#ai_username").val();
        let password = $("#ai_password").val();
        let company_name = $("#ai_company").val();
        let branch = $("#ai_branch").val();

        // quickbooks
        let qb_path = $("#qb_path").val();

        // dynamics365
        let login_url = $("#ds365_login_url").val();
        let resource_url = $("#ds365_resource_url").val();
        let client_id = $("#ds365_client_id").val();
        let client_secret = $("#ds365_client_secret").val();

        if (integration_system_id === INTEGRATION_SYSTEM_MANUAL_ID){
            if (!base_url || !username || !password || !company_name || !branch){
                dataOK = false;
            }
        }
        if (integration_system_id === INTEGRATION_SYSTEM_DYNAMICS365_ID){
            if (!login_url || !resource_url || !client_id || !client_secret){
                dataOK = false;
            }
        }
        if (integration_system_id === INTEGRATION_SYSTEM_QUICKBOOKS_ID){
            if (!qb_path){
                dataOK = false;
            }
        }

        if (dataOK){

            let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Saving ...';
            let originalText = elem.html();

            $.ajax({
                type: "POST",
                url: `/${DB_NAME}/settings/update_integration_system`,
                data: {
                    'integration_system_id': integration_system_id,
                    'acc_base_url': base_url,
                    'acc_username': username,
                    'acc_password': password,
                    'acc_company_name': company_name,
                    'acc_branch': branch,
                    'qb_path': qb_path,
                    'ds365_login_url': login_url,
                    'ds365_resource_url': resource_url,
                    'ds365_client_id': client_id,
                    'ds365_client_secret': client_secret,
                },
                beforeSend: function (xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                    elem.addClass('disabled').html(loadingText);
                },
                success: function (response) {
                    if( response.result === 'ok'){
                        modalAccountingIntegrationConfigurationData.modal('hide');
                        show_toast_success_message(response.message, 'topRight');
                        APP.show_app_loader();
                        setTimeout(function () {
                            location.reload();
                        }, 300);
                    } else {
                        show_toast_error_message(response.message);
                    }
                },
                complete: function() {
                    elem.removeClass('disabled').html(originalText);
                },
                error: function (response) {
                    show_toast_error_message(response.message);
                }
            });

        }else{
            show_toast_warning_message('All fields are required');
        }
    },

    change_integration_type: function () {

        // hide previous modal
        modalAccountingIntegrationChange.modal('hide');

        let integration_system_id = selectAccountingIntegrations.val();

        if (integration_system_id === INTEGRATION_SYSTEM_MANUAL_ID || integration_system_id === INTEGRATION_SYSTEM_NONE_ID){
            $.ajax({
                type: "POST",
                url: `/${DB_NAME}/settings/update_integration_system`,
                data: {
                    'integration_system_id': integration_system_id,
                },
                beforeSend: function (xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {
                    if( response.result === 'ok'){
                        btnShowModalIntegrationConfig.hide();
                        modalAccountingIntegrationConfigurationData.modal('hide');
                        show_toast_success_message(response.message, 'topRight');
                        APP.show_app_loader();
                        setTimeout(function () {
                            location.reload();
                        }, 100);
                    } else {
                        show_toast_error_message(response.message);
                    }
                },
                error: function (response) {
                    show_toast_error_message(response.message);
                }
            });

        }else{
            btnShowModalIntegrationConfig.show();
            modalAccountingIntegrationConfigurationData.modal('show');
            if (integration_system_id === INTEGRATION_SYSTEM_ACUMATICA_ID){
                fmAccountingIntegrationConfigurationDataAC.show();
                fmAccountingIntegrationConfigurationDataQB.hide();
                fmAccountingIntegrationConfigurationDataDS365.hide();
            } else if (integration_system_id === INTEGRATION_SYSTEM_DYNAMICS365_ID){
                fmAccountingIntegrationConfigurationDataDS365.show();
                fmAccountingIntegrationConfigurationDataAC.hide();
                fmAccountingIntegrationConfigurationDataQB.hide();
            }else{
                fmAccountingIntegrationConfigurationDataQB.show();
                fmAccountingIntegrationConfigurationDataAC.hide();
                fmAccountingIntegrationConfigurationDataDS365.hide();
            }
        }
    },

};

$(function () {

});

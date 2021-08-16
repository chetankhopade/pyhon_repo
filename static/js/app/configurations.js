let dtEdiConfigurations = '';
let modalAddConfiguration = $("#addConfiguration");
let tbodyEdiConfigurations = $("#tbodyEdiConfigurations");
let modalConfigurationDetails = $("#configurationDetails");

let Configurations = {
    name: 'Configurations',

    load_edi_configurations:function () {
        dtEdiConfigurations = $("#ediConfigurations").DataTable({
            lengthMenu:     [[50, 100, 150, -1], [50, 100, 150, "All"]],
            dom: "<'row'<'col-sm-4'l><'col-sm-4'i><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'><'col-sm-7'p>>",
            scrollY:        '45vh',
            scrollX:        true,
            processing:     true,
            serverSide:     true,
            responsive:     true,
            deferRender:    true,
            autoWidth:      false,
            order:          [[0, 'desc']],  // default ordered by 1st column
            language : {
                search:             "",
                searchPlaceholder:  "Search ...",
                infoFiltered: "",
                processing:         SPINNER_LOADER,
            },
            ajax: {
                url:    `edi/configurations/get_all_configurations`,
                type:   'POST',
            },
            columnDefs: [

                {
                    "targets": "_all",
                    "class": "no_wrap",
                    "width": 110,
                }

            ],
            columns: [
                {data: 'customer__name', class: 'show_details'},
                {data: 'partner__name', class: 'show_details'},
                {data: 'document_types', class: 'show_details'},
                {
                    data: '',
                    class: 'clickable',
                    render: function(data, type, row) {
                        let progressWidth = "0";
                        let progresColorClass = "";
                        if (row["config_status"] == "AS2 Ready"){
                            progressWidth = "5";
                            progresColorClass = "bg-warning";
                        }
                        else if(row["config_status"] == "Config Complete"){
                            progressWidth = "25";
                            progresColorClass = "bg-warning";
                        }
                        else if(row["config_status"] == "AS2 Tested"){
                            progressWidth = "35";
                            progresColorClass = "bg-warning";
                        }
                        else if(row["config_status"] == "Scripts Completed"){
                            progressWidth = "50";
                            progresColorClass = "bg-warning";
                        }
                        else if(row["config_status"] == "Manual Check"){
                            progressWidth = "60";
                            progresColorClass = "bg-warning";
                        }
                        else if(row["config_status"] == "Automation On"){
                            progressWidth = "90";
                            progresColorClass = "bg-warning";
                        }
                        else if(row["config_status"] == "Stopped"){
                             progressWidth = "100";
                             progresColorClass = "bg-danger";
                        }
                        else if(row["config_status"] == "Complete"){
                             progressWidth = "100";
                             progresColorClass = "bg-success";
                        }
                        // return '<progress value="10" max="100" style="height:30px"></progress>';
                        return '<div class="progress"><div class="progress-bar '+progresColorClass+'" role="progressbar" style="width: '+progressWidth+'%; color: black;" aria-valuenow="'+progressWidth+'" aria-valuemin="0" aria-valuemax="100">'+progressWidth+'%</div></div>';
                    }
                },
                {
                    data: 'config_status',
                    class: 'show_details',
                    render: function(data, type, row) {
                        return '<span>' + data + '</span>';
                    }
                },
                {
                    data: 'status_change_date',
                    class: 'show_details',
                    render: function(data, type, row) {
                        if(row["is_status_changed_in_last_3_days"]){
                            return '<span style="color: red">'+data+'</span>';
                        }
                        else{
                            return '<span>'+data+'</span>';
                        }

                    }
                },
                {
                    data: '',
                    class: 'action_container',
                    render: function(data, type, row) {

                        let config_id = row["id"];
                        let one_level_down_action = '"one_level_down"';
                        let one_level_up_action = '"one_level_up"';
                        let stopped_action = '"stopped"';
                        let complete_action = '"complete"';
                        let set_action_from_list = '"set_action_from_list"';
                        let actions_icons = ""
                        if(row["config_status"] == "Complete"){
                            actions_icons += "<a href='#' class='ml-2 tt' title='Complete'>" + "<i class='fa fa-check-square' style='color: black;font-size: 13px;'></i>" + "</a>";
                        }
                        else{
                            if(row["config_status"] != "Pending"){
                                actions_icons += "<a href='#' class='ml-2 tt' onclick='Configurations.update_config_status("+config_id+", "+one_level_down_action+")' title='Set status down one level'>" + "<i class='fa fa-angle-left' style='color: black;font-size: 13px;'></i>" + "</a>";
                            }
                            else{
                                actions_icons += "<a href='#' class='ml-2 tt' title='Set status down one level'>" + "<i class='fa fa-angle-left' style='color: gray;font-size: 13px;'></i>" + "</a>";
                            }
                            actions_icons += "<a class='ml-2 tt' onclick='Configurations.update_config_status("+config_id+", "+stopped_action+")' title='Set status to Stopped'>" +  "<i class='fa fa-stop-circle' style='color: black;font-size: 13px;'></i>" + "</a>";
                            actions_icons += "<a href='#' class='ml-2 tt' onclick='Configurations.update_config_status("+config_id+", "+one_level_up_action+")' title='Set status up one level'>" + "<i class='fa fa-angle-right' style='color: black;font-size: 13px;'></i>" + "</a>";
                            actions_icons += "<a href='#' class='ml-2 tt' onclick='Configurations.update_config_status("+config_id+", "+complete_action+")' title='Set status to Complete'>" + "<i class='fa fa-angle-double-right' style='color: black;font-size: 13px;'></i>" + "</a>";
                            if(row["config_status"] == "Automation On") {
                                actions_icons += "<a href='#' class='ml-2 tt' onclick='Configurations.update_config_status(" + config_id + ", " + complete_action + ")' title='Set status to Complete'>" + "<i class='fa fa-trophy' style='color: black;font-size: 13px;'></i>" + "</a>";
                            }

                            let choices_option = "";
                            choices_option += "<ul style='list-style-type:none;padding-inline-start: unset'>";
                            for (let i=0;i<CONFIG_STATUSES.length;i++){
                                if(row["config_status"] == CONFIG_STATUSES[i]){
                                    choices_option += "<li><input type='radio' value='"+CONFIG_STATUSES[i]+"' name='choiceSelect_"+row['id']+"' id='choiceSelect_"+row['id']+"' checked>"+CONFIG_STATUSES[i]+"</li>";
                                }
                                else{
                                    choices_option += "<li><input type='radio' value='"+CONFIG_STATUSES[i]+"' name='choiceSelect_"+row['id']+"' id='choiceSelect_"+row['id']+"'>"+CONFIG_STATUSES[i]+"</li>";
                                }

                            }
                            choices_option += "</ul>";

                            actions_icons += "<a href='#' id='choices_" + row['id'] + "' class='ml-2 tt' title='Select status from choices' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>" + "<i class='fa fa-th-list' style='color: black;font-size: 13px;'></i>" + "</a>" +
                                "<div class='dropdown-menu' aria-labelledby='choices_" + row['id'] + "'>" +
                                "<div class='dropdown-item'>" +
                                "<span><strong>" + row['customer__name'] + " - " + row['partner__name'] + "<strong></span>" +
                                "</div>" +
                                "<div class='dropdown-item'>" +
                                "<span class='_700'>" + choices_option + "</span>" +
                                "</div>" +
                                "<div class='dropdown-item'>" +
                                "<a cid='"+row['id']+"' class='btn btn-warning btn-sm width-80px' onclick='Configurations.update_config_status("+config_id+", "+set_action_from_list+")'> Update</a>" +
                                "</div>" +
                                "</div>";

                        }
                        return '<span class="font-10">'+actions_icons+'</span>';
                    }
                },
            ],
        });
    },

    show_add_modal:function () {
         modalAddConfiguration.modal('show');
    },

    populate_customer_details:function (elem) {
        let edi_id = $('option:selected', elem).attr('edi_id');
        let edi_type = $('option:selected', elem).attr('edi_type');
        
        $("#id_customer_isa").val(edi_id);
        $("#id_customer_isa_descriptor").val(edi_type);
    },

    populate_partner_details:function (elem) {
        let partner_isa = $('option:selected', elem).attr('partner_isa');
        let partner_isa_descriptor = $('option:selected', elem).attr('partner_isa_descriptor');
        let partner_isa_test = $('option:selected', elem).attr('partner_isa_test');

        $("#id_partner_isa").val(partner_isa);
        $("#id_partner_isa_descriptor").val(partner_isa_descriptor);
        $("#id_partner_isa_test").val(partner_isa_test);
    },

    submit:function () {
        let formData = {
            'id_customer': $('#id_customer').val(),
            'id_customer_isa': $("#id_customer_isa").val(),
            'id_customer_isa_descriptor': $("#id_customer_isa_descriptor").val(),
            'id_partner': $('#id_partner').val(),
            'id_partner_acctno': $("#id_partner_acctno").val(),
            'id_partner_isa': $("#id_partner_isa").val(),
            'id_partner_isa_descriptor': $("#id_partner_isa_descriptor").val(),
            'id_partner_isa_test': $("#id_partner_isa_test").val(),
            'id_partner_gs_descriptor': $("#id_partner_gs_descriptor").val(),
            'id_main_path': $("#id_main_path").val(),
            'id_document_types': $("#id_document_types").val(),
            'id_token': $("#id_token").val(),
            'id_separator': $("#id_separator").val(),
            'id_terminator': $("#id_terminator").val(),
            'id_use_state': $("#id_use_state").is(":checked"),
            'id_sftp': $("#id_sftp").val(),
            'id_is_enabled': $("#id_is_enabled").is(":checked"),
            'id_single_997_st': $("#id_single_997_st").is(":checked"),
            'id_break_apart_844_files': $("#id_break_apart_844_files").is(":checked"),
            'id_outbound_folder': $("#id_outbound_folder").val(),
            'id_move_only': $("#id_move_only").is(":checked"),
            'id_error_recipients': $("#id_error_recipients").val(),
            'id_terms_type_code_id': $("#id_terms_type_code_id").val(),
            'id_terms_discount_percent_r16': $("#id_terms_discount_percent_r16").val(),
            'id_terms_discount_days_due': $("#id_terms_discount_days_due").val(),
            'id_terms_net_days': $("#id_terms_net_days").val(),
            'id_parameters': $("#id_parameters").val(),
        };

        console.log(formData);

        // validations
        if (!formData.id_customer){
            $("#id_customer").addClass('border-red');
            show_toast_error_message('Customer is required', 'bottomRight');
            return false;
        }

        if (!formData.id_customer_isa){
            $("#id_customer_isa").addClass('border-red');
            show_toast_error_message('Customer Isa is required', 'bottomRight');
            return false;
        }

        if (!formData.id_partner){
            $("#id_partner").addClass('border-red');
            show_toast_error_message('Partner is required', 'bottomRight');
            return false;
        }

        if (!formData.id_partner_acctno){
            $("#id_partner_acctno").addClass('border-red');
            show_toast_error_message('Partner Acctno is required', 'bottomRight');
            return false;
        }

        if (!formData.id_partner_isa){
            $("#id_partner_isa").addClass('border-red');
            show_toast_error_message('Partner isa is required', 'bottomRight');
            return false;
        }

        if (!formData.id_main_path){
            $("#id_main_path").addClass('border-red');
            show_toast_error_message('Main Path is required', 'bottomRight');
            return false;
        }

        if (!formData.id_document_types){
            $("#id_document_types").addClass('border-red');
            show_toast_error_message('Document Types is required', 'bottomRight');
            return false;
        }

        if (!formData.id_token){
            $("#id_token").addClass('border-red');
            show_toast_error_message('Token is required', 'bottomRight');
            return false;
        }

        if (!formData.id_terms_type_code_id){
            $("#id_terms_type_code_id").addClass('border-red');
            show_toast_error_message('Terms type code id is required', 'bottomRight');
            return false;
        }

        $.ajax({
            url: `edi/configurations/create`,
            type: "POST",
            data: formData,
            dataType: "json",
            success: function (response) {
                show_toast_success_message("Configuration is added successfully!", 'bottomRight');
                dtEdiConfigurations.ajax.reload();
                Configurations.close_create_modal();
            },
            error: function (response) {
                show_toast_error_message(response.message, 'bottomRight');
            }

        });
    },

    close_create_modal:function () {
        modalAddConfiguration.modal('hide');
    },

    update_config_status:function (config_id, action, configuration_status="") {
        if(action == "set_action_from_list"){
            let radioButtonName = "choiceSelect_"+config_id;
             configuration_status = $("input[name='" + radioButtonName + "']:checked").val();
             if(!configuration_status){
                 show_toast_error_message("Please select status to update", 'bottomRight');
                 return false;
             }
        }
        $.ajax({
            url: `edi/configurations/update_status`,
            type: "POST",
            data: {'config_id': config_id, 'action': action, 'configuration_status': configuration_status},
            dataType: "json",
            success: function (response) {
                console.log(response);
                if(response.result == "ok"){
                    show_toast_success_message(response.message, 'bottomRight');
                }
                else{
                    show_toast_error_message(response.message, 'bottomRight');
                }
                dtEdiConfigurations.ajax.reload();
            },
            error:function () {
                show_toast_error_message("Error while updating the configuration status", 'bottomRight');
            }
        });

    },

}


$(function () {

    Configurations.load_edi_configurations();

    tbodyEdiConfigurations.on('click', 'td', function () {
        let elem = $(this);
        let elem_class = elem.attr("class");
        let parent_elem = elem.parent();
        let config_id = parent_elem.attr("id");

        console.log(elem_class);

        if (elem_class.includes("show_details")) {
            modalConfigurationDetails.modal('show');

            $.ajax({
                url: `edi/configurations/get_by_id`,
                type: "POST",
                data: {'config_id': config_id},
                dataType: "json",
                beforeSend: function (xhr, settings) {
                    modalConfigurationDetails.find('.modal-body').html('<div class="text-center"><img src="/static/images/loading2.gif" width="36" height="36" alt="loader"/></div>');
                },
                success: function (response) {
                    let html = '';
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Customer</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.customer.name;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Customer isa</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.customer_isa;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Customer isa descriptor</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.customer_isa_descriptor;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner.name;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner acctno</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner_acctno;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner isa</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner_isa;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner isa descriptor</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner_isa_descriptor;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.partner_isa_test === null) response.config_data.partner_isa_test = "";

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner isa test</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner_isa_test;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.partner_gs === null) response.config_data.partner_gs = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner gs</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner_gs;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.partner_gs_descriptor === null) response.config_data.partner_gs_descriptor = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Partner gs descriptor</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.partner_gs_descriptor;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.main_path === null) response.config_data.main_path = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Main Path</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.main_path;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.document_types === null) response.config_data.document_types = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Document Types</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.document_types;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.token === null) response.config_data.token = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Token</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.token;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.separator === null) response.config_data.separator = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Separator</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.separator;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.terminator === null) response.config_data.terminator = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Terminator</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.terminator;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.sftp === null) response.config_data.sftp = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Sftp</label>';
                    html += '<div class="col-9" style="text-align: left;">' + JSON.stringify(response.config_data.sftp);
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.is_enabled === null) response.config_data.is_enabled = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Is Enabled</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.is_enabled;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Single 997 st</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.single_997_st;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Break Apart 844 Files</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.break_apart_844_files;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.outbound_folder === null) response.config_data.outbound_folder = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Outbound Folder</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.outbound_folder;
                    html += '</div>';
                    html += '</div>';

                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Move Only</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.move_only;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.error_recipients === null) response.config_data.error_recipients = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Error Recipients</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.error_recipients;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.terms_type_code_id === null) response.config_data.terms_type_code_id = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Terms Type Code Id</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.terms_type_code_id;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.terms_discount_percent_r16 === null) response.config_data.terms_discount_percent_r16 = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Terms discount percent r16</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.terms_discount_percent_r16;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.terms_discount_days_due === null) response.config_data.terms_discount_days_due = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Terms discount days due</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.terms_discount_days_due;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.terms_net_days === null) response.config_data.terms_net_days = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Terms net days</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.terms_net_days;
                    html += '</div>';
                    html += '</div>';

                    if (response.config_data.parameters === null) response.config_data.parameters = "";
                    html += '<div class="form-group row required">';
                    html += '<label class="col-3 col-form-label font-weight-bold">Parameters</label>';
                    html += '<div class="col-9" style="text-align: left;">' + response.config_data.parameters;
                    html += '</div>';
                    html += '</div>';

                    $('#configurationDetails').find('.modal-body').html(html);

                    // modalConfigurationDetails.modal('show');
                },
                error: function (response) {
                    show_toast_error_message(response.message, 'bottomRight');
                }

                // });


            });
        }
    });

});
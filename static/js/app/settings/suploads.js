// modals
let modalImportCompanyData = $("#modalImportCompanyData");
let modalImportCompanyCBHistory = $("#modalImportCompanyCBHistory");

let modalMembershipFileUpload = $("#modalMembershipFileUpload");
let modalContractMembersUploadResults = $("#modalContractMembersUploadResults");
let modalUploadMemberConfirmContractsResults = $('#modalUploadMemberConfirmContractsResults');
// Others
let uploadMembersContinue = $("#uploadMembersContinue");
let uploadMembersClose = $("#uploadMembersClose");

let uploadMemberConfirmContinue = $("#uploadMemberConfirmContinue");
let uploadMemberConfirmClose = $("#uploadMemberConfirmClose");

// Upload, Add missing Contract
let addMissingContract = $("#addMissingContract");
let action_close_modal = $("#action_close_modal");
let action_create_contract = $("#action_create_contract");

let pleaseWait = $('#pleaseWaitDialog');

// Global Variables for missing lists
let missing_contract_list = [];
let missing_contract_list_exclude = [];
// Dropzone for Import Company Data
Dropzone.options.formImportCompanyDataDZ = {
    paramName: "file",  // The name that will be used to transfer the file
    maxFilesize: 5,     // MB
    acceptedFiles: ".xls, .xlsx",
    uploadMultiple: false,
    maxFiles: 1,
    init: function() {
        this.on("complete", function(response) {
            company_data_import_process_finished();
        });
    }
};

let company_data_import_process_finished = function(){
    modalImportCompanyData.hide();
    show_toast_success_message('Data has been succesfully imported to the company.', 'topRight');
    APP.show_app_loader();
    setTimeout(function () {
        location.reload();
    }, 300);
};

// Dropzone for Import Company CBHistory
Dropzone.options.formImportCompanyCBHistoryDZ = {
    paramName: "file",  // The name that will be used to transfer the file
    maxFilesize: 5,     // MB
    acceptedFiles: ".xls, .xlsx",
    uploadMultiple: false,
    maxFiles: 1,
    init: function() {
        this.on("complete", function() {
            company_cbhistory_import_process_finished();
        });
    }
};

let company_cbhistory_import_process_finished = function(){
    modalImportCompanyCBHistory.hide();
    show_toast_success_message('CBHistory data has been succesfully imported.', 'topRight');
    setTimeout(function () {
        location.reload();
    }, 300);
};


// Dropzone for Import Contract Membership Data
Dropzone.options.formMembershipFileUploadDZ = {
    paramName: "file",  // The name that will be used to transfer the file
   // maxFilesize: 5,     // MB EA-1510
    acceptedFiles: ".xls, .xlsx",
    uploadMultiple: false,
    maxFiles: 1,
    timeout: 180000,
    success: function(file, response){
        this.removeFile(file);
        contract_upload_members_finished(response);
    },
    error:function (file) {
        this.removeFile(file);
        show_toast_error_message('Allowed file types are .xls and .xlsx', 'bottomRight');
    },
    //Called just before each file is sent
    sending: function(file, xhr, formData) {
         //Execute on case of timeout only
         xhr.ontimeout = function(e) {
             //Output timeout error message here
                     show_toast_error_message('Server Timeout', 'bottomRight');

         };
     }
    // init: function() {
    //     this.on("success", function(file, response) {
    //         console.log(response);
    //         if(response.result == "ok"){
    //             modalMembershipFileUpload.hide();
    //             show_toast_success_message(response.message, 'topRight');
    //             APP.show_app_loader();
    //             setTimeout(function () {
    //                 location.reload();
    //             }, 300);
    //         }
    //         else if(response.result === "bad"){
    //             show_toast_error_message(response.message, 'bottomRight');
    //         }
    //     });
    // }
};

let contract_upload_members_finished = function(response){
    if(response.result === "bad"){
        show_toast_error_message(response.message, "bottomRight");
    }
    else{
        if(response.result === "ok" && response.error === "y"){
            let error_type = response.error_type;
            let html = '';
            let error_message = response.message
            if(error_type === "primary_validations"){
                uploadMemberConfirmClose.hide();
                let errors = response.errors
                if (errors.length > 0){
                    html += '<p>' + error_message +'</p><ul>';
                    for (let i=0; i < errors.length; i++){
                        let elconfirm_and_process_uploadem = errors[i];
                        html += '<li>'+elem+'</li>';
                    }
                    html += '</u>';
                }
                modalContractMembersUploadResults.find('.modal-body').addClass("height-200");
                modalContractMembersUploadResults.find('.modal-body').removeClass("height-500");
                modalContractMembersUploadResults.find('.modal-dialog').removeClass("modal-xxl");
            }else if(error_type === "confirm_validations"){ // Ticket EA-1436 changes

                let contract_list = response.contract_list;
                const arr = Object.keys(contract_list).map((key) => [key, contract_list[key]]);

               if(arr.length ==0){
                     uploadMemberConfirmContinue.hide();
                     modalMembershipFileUpload.modal('hide');
                     modalUploadMemberConfirmContractsResults.modal('hide');
                     show_toast_error_message("No record exist", "bottomRight");
                }else{
                html += '<table class="table table-striped table-bordered" border="1">';
                html += '<thead><tr><th>Contracts</th><th>Lines Count</th></tr></thead>';
                html += '<tbody>';
                 for(let i = 0; i < arr.length; i++) {
                        for(let j=0; j<1; j++ ) {
                            html += '<tr>';
                            html += '<td>' + arr[i][0] + '</td>';
                            html += '<td>' + arr[i][1] + '</td>';
                        }
                    }
                     html += '</td>';
                     html += '</tr>';
                     html += '</tbody>';
                     html += '</table>';
                     uploadMemberConfirmClose.attr('filename', response.filename)
                     uploadMemberConfirmContinue.show();
                    if ($('#download_error_file').length){
                        $( "#download_error_file" ).remove();
                    }
                }

            } // end here EA-1436
            else if(error_type == "missing_error"){
                let errors_missing_contracts = response.errors_missing_contracts
                if(errors_missing_contracts.length > 0){
                    missing_contract_list = errors_missing_contracts;
                    html = CONTRACT_Membership.draw_upload_missing_table(missing_contract_list);

                }
                uploadMemberConfirmClose.attr('filename', response.filename)
                uploadMemberConfirmContinue.show();
                if ($('#download_error_file').length){
                    $( "#download_error_file" ).remove();
                }
                modalContractMembersUploadResults.find('.modal-body').addClass("height-200");
                // modalContractMembersUploadResults.find('.modal-body').removeClass("height-500");
                modalContractMembersUploadResults.find('.modal-dialog').removeClass("modal-xxl");
                modalContractMembersUploadResults.find('.modal-dialog').addClass("modal-xl");
            }
            // If errors , display errors in Results Modal
            modalMembershipFileUpload.modal('hide');
            modalUploadMemberConfirmContractsResults.find('.modal-body').html(html);
            modalUploadMemberConfirmContractsResults.modal({backdrop: 'static', keyboard: false}).modal('show');
        }
        else{
            let processed_records = response.processed_records;
            let processing_errors = response.processing_errors;
            let filename = response.filename
            let htmlData = CONTRACT_Membership.draw_success_table(processed_records, processing_errors, filename);

            if(htmlData != ''){
                uploadMemberConfirmClose.attr('filename','');
                uploadMemberConfirmContinue.hide();
                modalMembershipFileUpload.modal('hide');
                modalUploadMemberConfirmContractsResults.find('.modal-dialog').addClass('modal-xxl');
                modalUploadMemberConfirmContractsResults.find('.modal-body').html(htmlData);
                uploadMemberConfirmClose.html("Close");
                modalUploadMemberConfirmContractsResults.modal({backdrop: 'static', keyboard: false}).modal('show');
            }

            modalUploadMemberConfirmContractsResults.modal('hide');
            modalMembershipFileUpload.modal('hide');
            // show_toast_success_message(response.message, "bottomRight");
        }
    }
};

let CONTRACT_Membership = {
    name: 'CONTRACT_Membership',

    draw_upload_missing_table:function(missing_contract_list, exclude=''){
        let rowCounter = 0;
        let html = '<h5>Following contract numbers does not exists in the system. Please add them to continue.</h5>';
        html += '<div id="missing_error_container">';
        html += '<table class="table table-striped table-bordered">';
        html += '<thead><tr><th>Number</th><th>Action</th></tr></thead>';
        html += '<tbody>';
        for (let i=0; i < missing_contract_list.length; i++) {
            let elem = missing_contract_list[i];
            let contract_number = "'"+elem.entity+"'";
            if(exclude !== elem.entity && !missing_contract_list_exclude.includes(elem.entity)){
                rowCounter += 1;
                html += '<tr>';

                // html += '<td>'+elem.type+'</td>';
                html += '<td>'+elem.entity+'</td>';
                html += '<td><button class="btn btn-sm btn-primary" onclick="CONTRACT_Membership.add_contract_modal('+contract_number+')">Add Contract</button></td>';

                html += '</tr>';
            }else{
                missing_contract_list_exclude.push(elem.entity);
            }

        }
        html += '</tbody>';
        html += '</table>';
        html += '</div>';

        if (rowCounter == 0){
            html = "<h5 style='color: green'>All missing contracts are added successfully! Please click on Continue to process the file</h5>";
        }

        return html;
    },

    draw_success_table:function(processed_records, processing_errors, filename=''){
        let html = '';
        if(processed_records.length > 0){
            html += '<h5 style="color: green">Number of relationships processed successfully</h5>';
            html += '<div id="processed_records_table">';
            html += '<table class="table table-striped table-bordered">';
            html += '<thead><tr><th>Number</th><th>Count</th></tr></thead>';
            html += '<tbody>';
            for (let i=0; i < processed_records.length; i++) {
                let elem = processed_records[i];
                html += '<tr>';

                html += '<td>'+elem.contract+'</td>';
                html += '<td>'+elem.processed_successfully+'</td>';

                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            html += '</div>';

        }
        if(processing_errors.length > 0){
            if ($('#download_error_file').length){
                $( "#download_error_file" ).remove();
            }
            $('<a class="btn btn-warning" id="download_error_file" href="/'+DB_NAME+'/contract_upload/update/'+filename+'/download">Download the error file</a>').insertAfter("#uploadMembersContinue");
            html += '<div class="row"><div class="col-6 text-left"><h5 style="color: red">Records failed to processed</h5></div></div><br/>';
            html += '<div id="processing_errors_table">';
            html += '<table class="table table-striped table-bordered">';
            html += '<thead><tr><th>CONTRACT</th><th>MEMBER_LOCNO</th><th>COT</th><th>Start_Date</th><th>End_Date</th><th>Error Type</th><th>Error Detail</th></tr></thead>';
            html += '<tbody>';

            for (let i=0; i < processing_errors.length; i++) {
                let elem = processing_errors[i];
                let processing_error_messages = elem.message
                html += '<tr>';

                html += '<td>'+elem.contract+'</td>';
                html += '<td>'+elem.indc_loc_number+'</td>';
                html += '<td>'+elem.cot+'</td>';
                html += '<td>'+elem.submitted_start_date+'</td>';
                html += '<td>'+elem.submitted_end_date+'</td>';
                html += '<td>'+elem.type_text+'</td>';
                html += '<td>';
                for (let j=0;j < processing_error_messages.length;j++){
                    html += processing_error_messages[j];

                    if(j != processing_error_messages.length -1){
                        html += '</br>';
                    }
                }
                // html += '<td>'+elem.message+'</td>';
                html += '</td>';
                html += '</tr>';
            }
            html += '</tbody>';
            html += '</table>';
            html += '</div>';

        }
        return html
    },

    close_upload_result_modal:function(elem){
        let filename = elem.attr('filename');
        let url = `/${DB_NAME}/contract_members_upload/${filename}/delete`;
        if(filename !== ""){
            $.ajax({
                url: url,
                type: "POST",
                dataType: "json",
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {
                    if(response.result === 'ok') {
                        modalContractMembersUploadResults.modal('hide');
                        modalUploadMemberConfirmContractsResults.modal('hide');
                        // show_toast_success_message(response.message, 'bottomRight');
                    }else{
                        show_toast_error_message(response.message, 'bottomRight');
                    }
                },
                error: function (response) {
                    show_toast_error_message(response.message, 'bottomRight');
                }
            });
        }
        else{
            modalContractMembersUploadResults.modal('hide');
            modalUploadMemberConfirmContractsResults.modal('hide');
        }

    },

    add_contract_modal:function(contract_number){
        $("#action_buttons").appendTo("#addMissingContractFooter");
        $("#inputContractNumber").val(contract_number);
        $("#inputContractNumber").prop("disabled", true);
        action_close_modal.attr('data-dismiss',"modal");
        action_close_modal.attr('onclick', '');
        action_create_contract.attr('onclick', 'CONTRACT_HANDLER.submit("create","membership_missing_modal","'+contract_number+'")');
        addMissingContract.modal('show');
    },

    check_and_process_upload:function(){
        let filename = uploadMembersClose.attr('filename');
        if((filename !== "") && (missing_contract_list.length > 0 || missing_item_list.length > 0)) {

            $.ajax({
                url: `/${DB_NAME}/settings/uploads/membership_data`,
                type: "POST",
                data: {
                    'check_missing': "1",
                    'confirm_upload': "1",
                    'filename': filename,
                    'missing_contract_list': JSON.stringify(missing_contract_list),
                },
                dataType: "json",
                beforeSend: function (xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {

                    if(response.result === "bad"){
                        show_toast_error_message(response.message, "bottomRight");
                    }
                    else {
                        if(response.result === "ok" && response.error === "y"){
                            let error_type = response.error_type;
                            let html = '';
                            let error_message = response.message
                            if(error_type === "primary_validations"){
                                uploadMembersContinue.hide();
                                let errors = response.errors
                                if (errors.length > 0){
                                    html += '<p>' + error_message +'</p><ul>';
                                    for (let i=0; i < errors.length; i++){
                                        let elem = errors[i];
                                        html += '<li>'+elem+'</li>';
                                    }
                                    html += '</u>';
                                }
                                modalContractMembersUploadResults.find('.modal-body').addClass("height-200");
                                modalContractMembersUploadResults.find('.modal-body').removeClass("height-500");
                                modalContractMembersUploadResults.find('.modal-dialog').removeClass("modal-xxl");
                            }
                            else if(error_type == "missing_error"){
                                let errors_missing_contracts = response.errors_missing_contracts
                                if(errors_missing_contracts.length > 0){
                                    missing_contract_list = errors_missing_contracts;
                                    html = CONTRACT_Membership.draw_upload_missing_table(missing_contract_list);

                                }
                                uploadMembersClose.attr('filename', response.filename)
                                uploadMembersContinue.show();
                                if ($('#download_error_file').length){
                                    $( "#download_error_file" ).remove();
                                }
                                modalContractMembersUploadResults.find('.modal-body').addClass("height-200");
                                // modalContractMembersUploadResults.find('.modal-body').removeClass("height-500");
                                modalContractMembersUploadResults.find('.modal-dialog').removeClass("modal-xxl");
                                modalContractMembersUploadResults.find('.modal-dialog').addClass("modal-xl");
                            }
                            // If errors , display errors in Results Modal
                            modalMembershipFileUpload.modal('hide');
                            modalContractMembersUploadResults.find('.modal-body').html(html);
                            modalContractMembersUploadResults.modal({backdrop: 'static', keyboard: false}).modal('show');
                        }
                        else{
                            let processed_records = response.processed_records;
                            let processing_errors = response.processing_errors;
                            let filename = response.filename
                            let htmlData = CONTRACT_Membership.draw_success_table(processed_records, processing_errors, filename);

                            if(htmlData != ''){
                                uploadMembersClose.attr('filename','');
                                uploadMembersContinue.css('display','none');
                                modalMembershipFileUpload.modal('hide');
                                modalContractMembersUploadResults.find('.modal-body').html(htmlData);
                                modalContractMembersUploadResults.find('.modal-dialog').addClass("modal-xxl");
                                uploadMembersClose.html("Close");
                                modalContractMembersUploadResults.modal({backdrop: 'static', keyboard: false}).modal('show');
                            }

                            modalMembershipFileUpload.modal('hide');
                            // show_toast_success_message(response.message, "bottomRight");
                        }
                    }
                }
            });
        }
    },

    confirm_and_process_upload:function(){
        let filename = uploadMemberConfirmClose.attr('filename');
        pleaseWait.modal('show');
        $.ajax({
                url: `/${DB_NAME}/settings/uploads/membership_data`,
                type: "POST",
                data: {
                    'confirm_upload': "1",
                    'filename': filename,
                },
                dataType: "json",
                beforeSend: function (xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {
                    pleaseWait.modal('hide');
                    if(response.result === "bad"){
                        show_toast_error_message(response.message, "bottomRight");
                    }
                    else {
                        if(response.result === "ok" && response.error === "y"){
                            let error_type = response.error_type;
                            let html = '';
                            let error_message = response.message
                            if(error_type === "primary_validations"){
                                uploadMembersContinue.hide();
                                let errors = response.errors
                                if (errors.length > 0){
                                    html += '<p>' + error_message +'</p><ul>';
                                    for (let i=0; i < errors.length; i++){
                                        let elem = errors[i];
                                        html += '<li>'+elem+'</li>';
                                    }
                                    html += '</u>';
                                }
                                modalContractMembersUploadResults.find('.modal-body').addClass("height-200");
                                modalContractMembersUploadResults.find('.modal-body').removeClass("height-500");
                                modalContractMembersUploadResults.find('.modal-dialog').removeClass("modal-xxl");
                            }
                            else if(error_type == "missing_error"){
                                let errors_missing_contracts = response.errors_missing_contracts
                                if(errors_missing_contracts.length > 0){
                                    missing_contract_list = errors_missing_contracts;
                                    html = CONTRACT_Membership.draw_upload_missing_table(missing_contract_list);

                                }
                                uploadMembersClose.attr('filename', response.filename)
                                uploadMembersContinue.show();

                                if ($('#download_error_file').length){
                                    $( "#download_error_file" ).remove();
                                }
                                modalContractMembersUploadResults.find('.modal-body').addClass("height-200");
                                // modalContractMembersUploadResults.find('.modal-body').removeClass("height-500");
                                modalContractMembersUploadResults.find('.modal-dialog').removeClass("modal-xxl");
                                modalContractMembersUploadResults.find('.modal-dialog').addClass("modal-xl");
                            }
                            // If errors , display errors in Results Modal
                            modalMembershipFileUpload.modal('hide');
                            modalUploadMemberConfirmContractsResults.modal('hide');
                            modalContractMembersUploadResults.find('.modal-body').html(html);
                            modalContractMembersUploadResults.modal({backdrop: 'static', keyboard: false}).modal('show');
                        }
                        else{
                            let processed_records = response.processed_records;
                            let processing_errors = response.processing_errors;
                            let filename = response.filename
                            let htmlData = CONTRACT_Membership.draw_success_table(processed_records, processing_errors, filename);

                            if(htmlData != ''){
                                uploadMembersClose.attr('filename','');
                                uploadMembersContinue.css('display','none');
                                modalMembershipFileUpload.modal('hide');
                                modalContractMembersUploadResults.find('.modal-body').html(htmlData);
                                modalContractMembersUploadResults.find('.modal-dialog').addClass("modal-xxl");
                                uploadMembersClose.html("Close");
                                modalContractMembersUploadResults.modal({backdrop: 'static', keyboard: false}).modal('show');
                            }
                            modalUploadMemberConfirmContractsResults.modal('hide');
                            modalMembershipFileUpload.modal('hide');
                            // show_toast_success_message(response.message, "bottomRight");
                        }
                    }
                }
            });

    },

    download_cm_list: function () {
        window.open('/'+DB_NAME+'/settings/download_cm_list', '_blank');
    },

};

$(function () {
    // Clean the modal when its closed
    addMissingContract.on('hidden.bs.modal', function () {
        $("#fmContract")[0].reset();
        $(".btnCreateContractTypes").removeClass('btn-warning').addClass('btn-default');
        $("#inputContractType").val("");
        $('#selectContractCustomer').val($('#selectContractCustomer option:first-child').val()).trigger('change');
        $('#selectContractEligibility').val($('#selectContractEligibility option:first-child').val()).trigger('change');
    });
});
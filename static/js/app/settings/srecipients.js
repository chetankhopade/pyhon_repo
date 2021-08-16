// elements
let btnAddRecipient = $("#btnAddRecipient");
let inputRecipientEmail = $("#inputRecipientEmail");
let inputRecipientFirstName = $("#inputRecipientFirstName");
let inputRecipientLastName = $("#inputRecipientLastName");
let tbodyRecipientsProcessing = $("#tbodyRecipientsProcessing");
let tbodyRecipientsAlert = $("#tbodyRecipientsAlert");
let modalRecipient = $("#modalRecipient");


let SETTINGS_RECIPIENTS = {

    name: 'SETTINGS_RECIPIENTS',

    load_recipients: function (rt) {

        let tbodyElement = '';
        if (rt === 'p'){
            tbodyElement = tbodyRecipientsProcessing;
        }else{
            tbodyElement = tbodyRecipientsAlert;
        }

        $.ajax({
            type: "POST",
            url: '/'+DB_NAME+'/settings/recipients',
            data: {
                'rt': rt,
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
                tbodyElement.html('<tr><td colspan="10" class="text-center">'+SPINNER_LOADER_MD+'</td></tr>');
            },
            success: function (response) {
                // load table data
                let html = '';
                if (response.recipients.length > 0){
                    for (let i=0; i <response.recipients.length; i++){
                        let elem = response.recipients[i];
                        html += '<tr>' +
                                    '<td>'+elem.email+'</td>' +
                                    '<td>'+elem.first_name+'</td>' +
                                    '<td>'+elem.last_name+'</td>' +
                                    '<td class="text-center">' +
                                        '<div class="dropleft">' +
                                            '<a href="#" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                                                '<i class="fas fa-times"></i>' +
                                            '</a>' +
                                            '<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">' +
                                                '<div class="dropdown-item _700">' +
                                                    'Remove recipient: ' + elem.email + '?' +
                                                '</div>' +
                                                '<div class="dropdown-item">' +
                                                    '<a onclick="SETTINGS_RECIPIENTS.remove($(this))" rid="'+elem.id+'" rt="'+rt+'" class="btn btn-warning btn-sm width-80px"> ' +
                                                        'Remove' +
                                                    '</a>' +
                                                    '<a class="btn btn-primary btn-sm ml-1 width-80px">Cancel</a>' +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                    '</td>' +
                                '</tr>';
                    }
                }else{
                    html += '<tr><td colspan="4" class="text-center _700">No Recipients</td></tr>'
                }
                // add content html to tbody
                tbodyElement.html(html);
            },
            error: function () {
                show_toast_error_message('Internal Error', 'bottomRight');
            }
        });
    },

    show_modal: function (rt) {
        // clean fields first
        inputRecipientEmail.val('');
        inputRecipientFirstName.val('');
        inputRecipientLastName.val('');

        // show modal title dynamically and assign recipient type to add button
        if (rt === 'p'){
            modalRecipient.find('.modal-title') .html('Add Processing Alert Recipient');
        }else{
            modalRecipient.find('.modal-title') .html('Add Alert Recipient');
        }
        btnAddRecipient.attr('rt', rt);
        modalRecipient.modal('show');
    },

    add_recipient: function (elem){
        let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Adding...';
        let originalText = elem.html();

        let r_type = elem.attr('rt');
        let r_email = inputRecipientEmail.val();
        let r_firstname = inputRecipientFirstName.val();
        let r_lastname = inputRecipientLastName.val();

        if (!r_email){
            show_toast_error_message('Email is required', 'topRight');
            return false;
        }
        if (!r_firstname){
            show_toast_error_message('First Name is required', 'topRight');
            return false;
        }

        $.ajax({
            type: "POST",
            url: '/'+DB_NAME+'/settings/recipients/add',
            data: {
                'email': r_email,
                'firstname': r_firstname,
                'lastname': r_lastname,
                'rtype': r_type
            },
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
                elem.addClass('disabled').html(loadingText);
            },
            success: function (response) {
                if (response.result === 'ok'){
                    show_toast_success_message(response.message, 'bottomRight');
                    modalRecipient.modal('hide');
                    // load table again
                    SETTINGS_RECIPIENTS.load_recipients(r_type);
                }else{
                    show_toast_error_message(response.message);
                }
            },
            complete: function() {
                elem.removeClass('disabled').html(originalText);
            },
            error: function () {
                elem.removeClass('disabled').html(originalText);
                show_toast_error_message('Internal Error', 'bottomRight');
            }
        });
    },

    remove: function (elem) {
        let rid = elem.attr('rid');
        let rt = elem.attr('rt');

        if (rid && rt){
            $.ajax({
                type: "POST",
                url: '/'+DB_NAME +'/settings/recipients/'+rid+'/remove',
                data: {
                    'rt': rt
                },
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {
                    if (response.result === 'ok'){
                        show_toast_success_message(response.message, 'bottomRight');
                        // load table again
                        SETTINGS_RECIPIENTS.load_recipients(rt);
                    }else{
                        show_toast_error_message(response.message);
                    }
                },
                error: function () {
                    show_toast_error_message('Internal Error');
                }
            })
        }else{
            show_toast_error_message('Error removing recipient');
        }

    },

};

$(function (){

    $(".nav-link").click(function () {
        let tab_option = $(this).attr('data-target');
        if (tab_option === '#tabRecipients'){
            SETTINGS_RECIPIENTS.load_recipients('p');
            SETTINGS_RECIPIENTS.load_recipients('a');
        }
    })

});

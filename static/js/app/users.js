// modal
let usersModal = $("#usersModal");

// forms
let fmUser = $("#fmUser");
let fmActivateUser = $("#fmActivateUser");

// inputs
let inputNewUserPassword = $("#inputNewUserPassword");
let inputNewUserPasswordConfirm = $("#inputNewUserPasswordConfirm");


let USERS = {

    name: 'USERS',

    create: function (){

        let formData = new FormData(fmUser[0]);

        // direct_customers list to send it to the backend (only checked items)
        let selected_companies_ids = '';
        $(".checkboxCompany").each(function () {
            if ($(this).is(':checked')){
                selected_companies_ids += $(this).attr('cid') + ',';
            }
        });

        if (selected_companies_ids.length > 0) {
            // remove the last comma
            selected_companies_ids = selected_companies_ids.substring(0, selected_companies_ids.length - 1);

            formData.append('selected_companies_ids', selected_companies_ids);

            $.ajax({
                url: '/default/users',
                data: formData,
                type: "POST",
                dataType: "json",
                processData: false,
                contentType: false,
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },

                success: function (response) {
                    if(response.result === 'ok') {
                        show_toast_success_message('User succesfully created. An email has been sent to the user', 'topRight');
                        usersModal.modal('hide');
                        setTimeout(function () {
                            APP.ajax_redirect_url(response.redirect_url);
                        }, 300)

                    }else{
                        show_toast_error_message(response.message);
                    }
                },

                error: function (response) {
                    show_toast_error_message(response.message);
                }
            });

        }else{
            show_toast_error_message("Please select at least one company")
        }
    },

    activation: function (){

        let new_password = inputNewUserPassword.val();
        let confirm_password = inputNewUserPasswordConfirm.val();

        if (!new_password || !confirm_password){
            show_toast_error_message('Fields are required');
            return false;
        }
        else{
            if (!compareStrings(new_password, confirm_password)){
                show_toast_error_message('Passwords do not match');
                return false;

            }else{

                // SEND to the Server
                let data = new FormData(fmActivateUser[0]);

                $.ajax({
                    url: '/default/users/activation',
                    data: data,
                    type: "POST",
                    dataType: "json",
                    processData: false,
                    contentType: false,

                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                        }
                    },

                    success: function (response) {
                        if(response.result === 'ok') {
                            show_toast_success_message("Account is succesfully activated!!!");
                            setTimeout(function () {
                                APP.ajax_redirect_url(response.redirect_url);
                            }, 300)

                        }else{
                            show_toast_error_message(response.message);
                        }
                    },

                    error: function (response) {
                        show_toast_error_message(response.message);
                    }
                });

            }
        }
    },

};

$(function () {

    // Clean the modal when its closed
    $('#usersModal').on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
    });


});

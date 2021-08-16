// forms
let fmForgotPassword = $("#fmForgotPassword");
let fmResetPassword = $("#fmResetPassword");

// input
let inputEmail = $("#inputEmail");
let inputNewPassword = $("#inputNewPassword");
let inputConfirmPassword = $("#inputConfirmPassword");



let FORGOT_PASSWORD = {

    name: 'FORGOT_PASSWORD',

    send: function (elem){

        let email = inputEmail.val();

        if (!email){
            show_toast_error_message('Email is required');
        }
        else{
            if (!isValidEmailAddress(email)){
                show_toast_error_message('Invalid email address');
            }else{
                let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Sending...';
                let originalText = elem.html();
                let data = new FormData(fmForgotPassword[0]);

                $.ajax({
                    url: "/forgot_password",
                    data: data,
                    type: "POST",
                    dataType: "json",
                    processData: false,
                    contentType: false,

                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                        }
                        elem.addClass('disabled').html(loadingText);
                    },
                    success: function (response) {
                        if(response.result === 'ok') {
                            inputEmail.val('');
                            show_toast_success_message("An email has been succesfully sent");
                        }else{
                            show_toast_error_message(response.message);
                        }
                    },
                    complete: function () {
                        elem.removeClass('disabled').html(originalText);
                    },
                    error: function (response) {
                        elem.removeClass('disabled').html(originalText);
                        show_toast_error_message(response.message);
                    }
                });

            }
        }
    },

    reset: function (elem){

        let new_password = inputNewPassword.val();
        let confirm_password = inputConfirmPassword.val();

        if (!new_password || !confirm_password){
            show_toast_error_message('Fields are required');
            return false;
        }
        else{
            if (!compareStrings(new_password, confirm_password)){
                show_toast_error_message('Passwords do not match');
            }else{

                let loadingText = '<i class="fa fa-circle-o-notch fa-spin"></i> Reseting...';
                let originalText = elem.html();
                let data = new FormData(fmResetPassword[0]);

                $.ajax({
                    url: "/forgot_password",
                    data: data,
                    type: "POST",
                    dataType: "json",
                    processData: false,
                    contentType: false,

                    beforeSend: function(xhr, settings) {
                        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                        }
                        elem.addClass('disabled').html(loadingText);
                    },

                    success: function (response) {
                        if(response.result === 'ok') {
                            inputNewPassword.val('');
                            inputConfirmPassword.val('');
                            show_toast_success_message("Password has been succesfully updated");
                        }else{
                            show_toast_error_message(response.message);
                        }
                    },

                    complete: function () {
                        elem.removeClass('disabled').html(originalText);
                    },
                    error: function (response) {
                        elem.removeClass('disabled').html(originalText);
                        show_toast_error_message(response.message);
                    }
                });

            }
        }
    },

};

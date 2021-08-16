// forms
let fmEditProfile = $("#fmEditProfile");
let fmUploadAvatar = $("#fmUploadAvatar");
let fmEditFeedback = $("#fmEditFeedback");
let profileChangePasswordModal = $("#profileChangePasswordModal");

// modals
let profileModal = $("#profileModal");
let editProfileModal = $("#editProfileModal");
let feedbackmodal = $("#feedbackModal");

// div
let divStarsMessage = $('#divStarsMessage');
let divStars = $("#divStars");

let editProfileTitle = $("#editProfileTitle");
let editProfileDepartment = $("#editProfileDepartment");
let editProfileCompany = $("#editProfileCompany");
let editProfileTimeZone = $("#editProfileTimeZone");
let editProfileEmail = $("#editProfileEmail");
let editProfilePhone = $("#editProfilePhone");

// input
let inputStars = $("#inputStars");
let inputProfileOldPassword = $("#inputProfileOldPassword");
let inputProfileNewPassword = $("#inputProfileNewPassword");
let inputProfileConfirmPassword = $("#inputProfileConfirmPassword");

// select
let selectProfileAuditTrailsDataRanges = $("#selectProfileAuditTrailsDataRanges");
let selectProfileAuditTrailsUserCompanies = $("#selectProfileAuditTrailsUserCompanies");

// tables
let tableProfileAuditTrails = $("#tableProfileAuditTrails");
let dtProfileAuditTrails = '';


let PROFILE = {

    name: 'PROFILE',

    edit_modal: function (elem) {
        let title = elem.attr('profile_title');
        let department = elem.attr('profile_department');
        let company = elem.attr('profile_company');
        let timezone = elem.attr('profile_timezone');
        let email = elem.attr('profile_email');
        let phone = elem.attr('profile_phone');
        editProfileTitle.val(title);
        editProfileDepartment.val(department);
        editProfileCompany.val(company);
        editProfileTimeZone.val(timezone);
        editProfileEmail.val(email);
        editProfilePhone.val(phone);
        profileModal.modal('show');
    },

    save_changes: function (){

        let formData = new FormData(fmEditProfile[0]);
        // EA-1190 - No Email validation on profile.
        if (!isValidEmailAddress(formData.get('p_email'))){
            show_toast_error_message('Invalid email address');
            return false;
        }
        // EA-1191 No Phone No. validation on profile. Allow to take only special characters and numbers
        if(formData.get('p_phone') !== ''){
            if (!isValidPhoneNumber(formData.get('p_phone'))){
                show_toast_error_message('Please enter phone in valid format');
                return false;
            }
        }

        $.ajax({
            url: '/default/profile/edit',
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
                    show_toast_success_message('Profile succesfully updated !!!', 'topRight');
                    profileModal.modal('hide');
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
    },

    // feedbacks
    send_feedback: function (){

        let formData = new FormData(fmEditFeedback[0]);

        $.ajax({
            url: '/default/profile/feedback',
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
                    show_toast_success_message('Feedback successfully sent !!!', 'topRight');
                    feedbackmodal.modal('hide');
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
    },

    give_feedback: function () {
        let msg = '';
        let rating = $(this).attr('rating');
        divStars.starrr({
            // initialize with the last feedback  based on requirements
            rating: rating,
            // get the onChange event and build the logic in place
            change: function(e, value){
                // assign the value to inputStars to send it to the backend later
                inputStars.val(value);
                // show the previous message functionality
                if (value > 1) {
                    msg = "Thanks! You rated this <b>" + value + " stars</b>.";
                }
                else {
                    msg = "We will improve ourselves. You rated this <b>" + value + " stars</b>.";
                }
                divStarsMessage.find('.text-message').html(msg);
                divStarsMessage.fadeIn(200);
            }
        });
        feedbackmodal.modal("show");
    },

    // change password
    check_required_field: function (elem) {
        let is_valid = false;
        elem.parent().find('span').remove();
        if (elem.val() && elem.val() !== undefined && elem.val() !== ' '){
            elem.removeClass('border-red');
            is_valid = true;
        }else {
            elem.addClass('border-red');
            elem.parent().append('<span class="text-danger font-10">Field is required</span>');
            is_valid = false;
        }
        return is_valid;
    },

    change_password: function (elem){

        // validate inputs
        let is_valid_old_password = PROFILE.check_required_field(inputProfileOldPassword);
        let is_valid_new_password = PROFILE.check_required_field(inputProfileNewPassword);
        let is_valid_confirm_password = PROFILE.check_required_field(inputProfileConfirmPassword);

        if (is_valid_old_password && is_valid_new_password && is_valid_confirm_password) {

            let old_password = inputProfileOldPassword.val();
            let new_password = inputProfileNewPassword.val();
            let confirm_password = inputProfileConfirmPassword.val();

            if (new_password !== confirm_password) {
                inputProfileNewPassword.addClass('border-red');
                inputProfileConfirmPassword.addClass('border-red');
                show_toast_warning_message('New Passwords do not match');
                return false;
            }

            let loadingText = "<span class='font-11'><i class='fa fa-circle-o-notch fa-spin'></i> Saving... </span>";
            let originalText = elem.html();

            $.ajax({
                url: '/default/profile/change_password',
                data: {
                    'old_password': old_password,
                    'new_password': new_password,
                    'confirm_password': confirm_password,
                },
                type: "POST",
                dataType: "json",
                beforeSend: function(xhr, settings) {
                    elem.addClass('disabled').html(loadingText);
                },
                success: function (response) {
                    if(response.result === 'ok') {
                        show_toast_success_message('Password succesfully updated !', 'bottomRight');
                        profileChangePasswordModal.modal('hide');
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
        }else{
            show_toast_warning_message('Check input fields');
        }
    },

    // audit trails
    load_audit_trails_data: function (){
        // reload data table ajax (based on onchange event)
        dtProfileAuditTrails.ajax.reload();
    },
};


$(function () {

    // clean modal form
    profileChangePasswordModal.on('shown.bs.modal', function (e) {
        $(this).find('form input').val('');
    });

    // Clean the modal when its closed
    editProfileModal.on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
    });

    // Clean the modal when its closed
    feedbackmodal.on('hidden.bs.modal', function () {
        $(this).find('form').trigger('reset');
        $(this).find('.starrr').starrr({
            rating: 0
        });
        divStarsMessage.hide();
    });

    // upload file - avatar
    let readURL = function(input) {

        if (input.files && input.files[0]) {

            let reader = new FileReader();
            reader.onload = function (e) {
                // update src for Profile and Header Avatars
                $('#profileAvatar, #headerAvatar').attr('src', e.target.result);
            };
            reader.readAsDataURL(input.files[0]);

            // remove the purple background when new avatar was uploaded
            $(".upload-button").removeClass('empower_background_purple');

            // Get the formData (fields from Form) and add the file
            let formData = new FormData(fmUploadAvatar[0]);
            let file = input.files[0];
            formData.append('avatar', file);

            // Send Avatar to the server
            $.ajax({
                type: "POST",
                url: `/default/profile/avatar`,
                data: formData,
                processData: false,
                contentType: false,
                beforeSend: function(xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {
                    if(response.result === 'ok') {
                        show_toast_success_message('Avatar successfully saved !!!', 'topLeft');
                    }else{
                        show_toast_error_message(response.message);
                    }
                },

                error: function (response) {
                    show_toast_error_message(response.message);
                }
            });
        }
    };

    $(".file-upload").on('change', function(){
        readURL(this);
    });

    $(".upload-button").on('click', function() {
        $(".file-upload").click();
    });

    // // DataTable
    // dtProfileAuditTrails = tableProfileAuditTrails.DataTable({
    //     lengthMenu:     [[25, 50, 100, -1], [25, 50, 100, "All"]],
    //     scrollY:        '40vh',
    //     processing:     true,
    //     serverSide:     true,
    //     responsive:     true,
    //     info:           false,
    //     search:         false,
    //     // order:          [[0, 'desc']],  // default ordered by 1st column
    //     language : {
    //         search:             "",
    //         searchPlaceholder:  "Search ...",
    //         loadingRecords:     "&nbsp;",
    //         processing:         SPINNER_LOADER,
    //     },
    //     ajax: {
    //         url:    '/default/profile/load_audit_trail_data',
    //         type:   'POST',
    //         data: function ( d ) {
    //             return $.extend({}, d, {
    //                 "q": selectProfileAuditTrailsDataRanges.val(),
    //                 "db": selectProfileAuditTrailsUserCompanies.val(),
    //             });
    //         }
    //     },
    //     columns: [
    //         {
    //             data:   '',
    //             render: function(data, type, row) {
    //                 return  '<p class="empower-color-blue _700 pl-4">' + row["entity"] + '</p>' +
    //                     '<p class="pl-4">' +
    //                     row["username"] +
    //                     ' ' +
    //                     '<strong>' +
    //                     row["action"] +
    //                     ' ' +
    //                     row["entity"] +
    //                     ' ' +
    //                     row["reference"] +
    //                     '</strong>' +
    //                     ' ' +
    //                     '<span class="font-10">' +
    //                     row["message_time"] +
    //                     '</span>' +
    //                     '</p>';
    //             }
    //         },
    //     ],
    // });
    // // hide paging cause dt doesnt allow to do this in runtime
    // $('#tableProfileAuditTrails_filter').css("display", "none");
    // $('.dataTables_scrollHead').css("display", "none");


});

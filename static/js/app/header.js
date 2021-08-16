// Product Form fields
let headerinputProductNDC = $("#headerinputProductNDC");
let headerinputProductDescription = $("#headerinputProductDescription");
let headerinputProductAccountNumber = $("#headerinputProductAccountNumber");
let headerinputProductStrength = $("#headerinputProductStrength");
let headerinputProductSize = $("#headerinputProductSize");
let headerinputProductBrand = $("#headerinputProductBrand");
let headerinputProductUPC = $("#headerinputProductUPC");
let headertoggleProductStatus = $("#headertoggleProductStatus");

// Direct Customer
let headerfmCreateDirectCustomer = $("#headerfmCreateDirectCustomer");

let HEADER = {

    name: 'HEADER',
    // create product submit
    product_submit: function (elem) {

        let loadingComponent;
        let loadingMsg = 'Creating...';
        let url = `/${DB_NAME}/products/create`;

        loadingComponent = "<span class='font-11'><i class='fa fa-circle-o-notch fa-spin'></i> " + loadingMsg + "</span>";

        let headeritem_status = '2';
        if (headertoggleProductStatus.is(":checked")){
            headeritem_status = '1';
        }

        let formData = {
            'item_ndc': headerinputProductNDC.val(),
            'item_description': headerinputProductDescription.val(),
            'item_account_number': headerinputProductAccountNumber.val(),
            'item_strength': headerinputProductStrength.val(),
            'item_size': headerinputProductSize.val(),
            'item_brand': headerinputProductBrand.val(),
            'item_upc': headerinputProductUPC.val(),
            'item_status': headeritem_status,
        };

        // validations
        if (!formData.item_ndc){
            show_toast_error_message('Item NDC is required', 'bottomRight');
            return false;
        }
        if (!formData.item_account_number){
            show_toast_error_message('Item Account Number is required', 'bottomRight');
            return false;
        }

        $.ajax({
            url: url,
            type: "POST",
            data: formData,
            dataType: "json",
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
                elem.addClass('disabled').html(loadingComponent);
            },
            success: function (response) {
                if(response.result === 'ok') {
                    $('#headerModalProduct').modal('hide');
                    show_toast_success_message(response.message, 'bottomRight');
                }else{
                    show_toast_error_message(response.message, 'bottomRight');
                }
            },
            error: function (response) {
                show_toast_error_message(response.message, 'bottomRight');
            }
        });
    },

     customer_submit: function (elem) {
        let formData = null;
        formData = new FormData(headerfmCreateDirectCustomer[0]);

         if (!formData) {
             show_toast_error_message('FormData is missing');
         } else {
             $.ajax({
                 url: '/' + DB_NAME + '/customers/direct/create',
                 data: formData,
                 type: "POST",
                 dataType: "json",
                 processData: false,
                 contentType: false,
                 beforeSend: function (xhr, settings) {
                     if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                         xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                     }
                 },
                 success: function (response) {
                     switch (response.result) {
                         case 'ok':
                             // print success message
                             show_toast_success_message(response.message, 'topRight');
                             // close modal
                             $('#headermdlCreateCustomer').modal('hide');
                             /*setTimeout(function () {
                                 location.href = response.redirect_url;
                             }, 200);*/
                             break;

                        default:
                         show_toast_error_message(response.message);
                         break;
                     }
                 },
                 error: function (response) {
                     show_toast_error_message(response.message);
                 }
             });
         }

     }
};
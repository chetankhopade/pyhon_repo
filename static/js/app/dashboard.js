// date fields filters
let inputDashboardFilterStartDate = $("#inputDashboardFilterStartDate");
let inputDashboardFilterEndDate = $("#inputDashboardFilterEndDate");
let showFileContentModal = $("#showFileContentModal");

// Chart Canvas fields

// Loader Fields
let dtGraphGridTable = '';

let DASHBOARD = {

    name: 'DASHBOARD',
    indc_graph_range_filter: $('#date_range_filter option:selected').val(),
    indc_graph_dc_name: '',
    indc_graph_bgColor: 'orange',  // just default color
    cb_bar_color: 'orange',

    graph_category: '',
    graph_sales_type: '',

    apply_dates_filter: function(){
        let startDate = inputDashboardFilterStartDate.val();
        let endDate = inputDashboardFilterEndDate.val();
        if (startDate && endDate){
            let is_valid = validate_dates_with_month_first(inputDashboardFilterStartDate, inputDashboardFilterEndDate);
            if(!is_valid) {
                show_toast_error_message("End date cannot be earlier than start date");
                return false;
            } else {
                APP.show_app_loader();
                setTimeout(function () {
                    location.href = "/"+DB_NAME+"/dashboard?s="+startDate+"&e="+endDate;
                }, 300);
            }
        }else{
            show_toast_warning_message("Select dates to filter");
        }
    },
    get_dates_by_selected_range:function (range, calling_place="dashboard_main") {
        // Update div with response
        $.ajax({
            url: `/${DB_NAME}/dashboard/get_dates_by_selected_range`,
            type: 'POST',
            data: {
                "range": range
            },
            dataType: 'json'
        }).done(function(response){
            if(calling_place == "dashboard_pop_up"){
                $("#graph_range_sd").html(response.start_date);
                $("#graph_range_ed").html(response.end_date);
            }
            else{
                inputDashboardFilterStartDate.val(response.start_date);
                inputDashboardFilterEndDate.val(response.end_date);
            }

        });
    },
    apply_data_range_filter: function (elem) {
        let range = elem.val();
        if (range){

            $(".query_filter_name").text("("+range+")");

            DASHBOARD.get_dates_by_selected_range(range);

            $("#pop_up_range").val(range);


        }
    },
    formatNumber:function( v ) {
        // Change the '1' here to adjust decimal places
        var numOfDecimalPlaces = Math.pow( 10, 1 ) ;
        var suffixList = [ "k", "m", "b", "t" ] ;

        for ( var i = suffixList.length - 1; i >= 0; i-- ) {
            var size = Math.pow( 10, ( i + 1 ) * 3 ) ;
            if( size <= v ) {
                v = Math.round( v * numOfDecimalPlaces / size ) / numOfDecimalPlaces ;
                if ( ( v === 1000) && ( i < abbrev.length - 1 ) ) {
                    v = 1 ;
                    i++ ;
                }
                v += suffixList[ i ] ;
                break ;
            }
        }

        return v ;
    },

    formatNumberWithComma:function (number){
        // return number.toLocaleString('en-US', {minimumFractionDigits: 2})
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    load_graph_data_to_grid:function (){
        if (dtGraphGridTable !== undefined && dtGraphGridTable !== '') {
            dtGraphGridTable.destroy();
        }


        dtGraphGridTable = $("#graphGridTable").DataTable({
            lengthMenu:     [[50, 100, 150, -1], [50, 100, 150, "All"]],
            dom: "<'row'<'col-sm-4'l><'col-sm-4'i><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-5'><'col-sm-7'p>>",
            scrollY:        '83vh',
            scrollX:        true,
            processing:     true,
            serverSide:     true,
            responsive:     true,
            deferRender:    true,
            autoWidth:      false,
            order:          [[1, 'desc']],  // default ordered by 1st column
            language : {
                search:             "",
                searchPlaceholder:  "Search ...",
                infoFiltered: "",
                processing:         SPINNER_LOADER,
            },
            ajax: {
                url:    `dashboard/get_full_transactions_edi_api`,
                type:   'GET',
            },
            columnDefs: [
            {
                "targets":      [0],
                "visible":      false,
                "searchable":   false,
            },
            ],
            columns: [
                {data: 'id'},
                {data: 'date_received'},
                {data: 'time_received'},
                {data: 'doctype'},
                {
                    data: 'original_file',
                    render: function(data, type, row) {
                        var original_file_path = row["original_file_path"]
                        var myArr = original_file_path.split("#");
                        var dirname = myArr[0];
                        var file_name = myArr[1];
                        var company_id = myArr[2];
                        return '<span><a href="#" onclick="DASHBOARD.open_file_modal(\'' + dirname + '\',\'' + file_name + '\',\'' + company_id + '\')">' +row['original_file']+'</a></span>';
                    }
                },
                {
                    data: 'out_997',
                    render: function(data, type, row) {
                            var original_file_path = row["main_997_link"]
                            var myArr = original_file_path.split("#");
                             var dirname = myArr[0];
                             var file_name = myArr[1];
                             var company_id = myArr[2];
                            return '<span><a href="#" onclick="DASHBOARD.open_file_modal(\'' + dirname + '\',\'' + file_name + '\',\'' + company_id + '\')">' +row['out_997']+'</a></span>';
                    }
                },
                {
                    data: 'result_file',
                    render: function(data, type, row) {

                        var original_file_path = row["inbound_file_path"]
                            var myArr = original_file_path.split("#");
                             var dirname = myArr[0];
                             var file_name = myArr[1];
                             var company_id = myArr[2];
                            return '<span><a href="#" onclick="DASHBOARD.open_file_modal(\'' + dirname + '\',\'' + file_name + '\',\'' + company_id + '\')">' +row['result_file']+'</a></span>';

                    }
                },
                {data: 'outbound_response_file'},
                {data: 'outbound_X12_file'},
                {data: 'ack_result_file'},
            ],
        });
    },

    open_file_modal:function (dirname,file_name,company_id){
        // Get all reports
            $.ajax({
                url: '/dashboard/view',
                type: "POST",
                dataType: "text",
                data: { 'dirname': dirname,
                        'file_name':file_name,
                        'company_id':company_id
                            },
                beforeSend: function (xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                },
                success: function (response) {

                    let html = '';
                    if (response != "No") {

                        $("#filecontentModalBody").html('<pre>' + response + '</pre>');
                    }

                },
                error: function (response) {
                    show_toast_error_message("Error", 'bottomRight');
                }
            });
        showFileContentModal.modal('show');
    },

    export_grid_data:function(export_to="excel"){

        let category = DASHBOARD.graph_category;
        let sales_type = DASHBOARD.graph_sales_type;
        let range_to_filter = DASHBOARD.indc_graph_range_filter;
        let startDate = inputDashboardFilterStartDate.val();
        let endDate = inputDashboardFilterEndDate.val();
        if(range_to_filter === ""){
            range_to_filter = "custom";
            startDate = inputDashboardFilterStartDate.val();
            endDate = inputDashboardFilterEndDate.val();
        }

        let url = `/${DB_NAME}/dashboard/export_grid_data?export_to=${export_to}&category=${category}&action=${sales_type}&range=${range_to_filter}&start_date=${startDate}&end_date=${endDate}`;
        window.location = url;
    },



};


$(function () {

    // triggers select when page loads (default: MTD)
    let range_to_filter = $('#date_range_filter option:selected').val();
    let selected_year = $('#net_income_filter option:selected').val();
    DASHBOARD.load_graph_data_to_grid();


});
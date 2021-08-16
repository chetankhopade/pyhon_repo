let selectFileType = $("#selectFileType");
let selectFileStage = $("#selectFileStage");

let inputCreateDate = $("#inputCreateDate");
let inputEndDate = $("#inputEndDate");

let modalFileManagerDeleteFile = $("#modalFileManagerDeleteFile");
let spanFileManagerDeleteFileName = $("#spanFileManagerDeleteFileName");
let btnFileManagerDeleteFile = $("#btnFileManagerDeleteFile");

let btnFMFilterAllFiles = $("#btnFMFilterAllFiles");

let params = {
    stage: "",
    cdate: "",
    edate: ""
};

let tableFiles = $("#tableFiles");
let dataTable = undefined;

let FILEMANAGER = {

    name: 'FILEMANAGER',

    loadDataTable: function (dataset_files) {
        tableFiles.html('');
        if (dataset_files){
            dataTable = tableFiles.DataTable({
                lengthMenu: [[25, 50, 75, 100, -1], [25, 50, 75, 100, "All"]],
                dom: "<'row'<'col-sm-4'l><'col-sm-4'i><'col-sm-4'f>>" + "<'row'<'col-sm-12'tr>>" + "<'row dt_footer'<'col-sm-5' B><'col-sm-7'p>>",
                buttons: [
                {
                extend:    'excelHtml5',
                text:     '<i class="fa fa-file-excel-o">',
                titleAttr: 'Download Excel',
                className: 'btn btn-sm btn-default tt excel_dt_footer',
				title: '',
                //action: newexportaction,
                filename: function(){
                var d = new Date();
                // var n = d.getTime();
                var n = get_current_date_in_ymdhms_for_export();
                return 'Files_' + n;
                },
                exportOptions: {
                    columns: [0,1,2,3],
                },
            },
            {
                extend:    'csvHtml5',
                text:      '<i class="fa fa-file-text-o"></i>',
                titleAttr: 'Download CSV',
				className: 'btn btn-sm btn-default tt csv_dt_footer',
				title: '',
                //action: newexportaction,
                filename: function(){
                var d = new Date();
                // var n = d.getTime();
                var n = get_current_date_in_ymdhms_for_export();
                return 'Files_' + n;
                },
                exportOptions: {
                    columns: [0,1,2,3],
                },

            }
            ],
                scrollY:        "50vh",
                scrollCollapse: true,
                order: [[ 1, "desc" ]],
                data: dataset_files,
                language : {
                    search: "",
                    searchPlaceholder: "Search ..."
                },
                columns: [
                    {
                        title: "File Name",
                        data: '',
                        render: function (data, type, row) {
                            return "<span class='font-9'>"+row[0]+"</span>";
                        }
                    },
                    // EA-1663 - File Manager's sort by date not working
                    // Ref:- https://stackoverflow.com/questions/12003222/datatable-date-sorting-dd-mm-yyyy-issue
                    {
                        title: "Created Date/Time" ,
                        data: '',
                        render: function (data, type, row) {
                            return "<span class='font-10' style='display: none'>"+row[2]+"</span><span class='font-10'>"+row[1]+"</span>";
                        }
                    },
                    {
                        title: "Type",
                        data: '',
                        render: function (data, type, row) {
                            return "<span class='font-11'>"+row[3]+"</span>";
                        }
                    },
                    {
                        title: "Stage",
                        data: '',
                        render: function (data, type, row) {
                            return "<span class='font-10'>"+row[4]+"</span>";
                        }
                    },
                    {
                        title: "Actions",
                    },
                ],
                // columnDefs: [
                //     {
                //         type: 'date',
                //         'targets': [1]
                //     }
                // ],
            });
        }
    },

    getDirJSONResponse: function(elem){

        // to show active class in filter selected, default all files
        if (!elem || elem === ''){
            elem = btnFMFilterAllFiles;
        }
        $(".nav-link").removeClass('active');
        elem.addClass('active');

        if (dataTable !== undefined) {
            dataTable.destroy();
        }

        let dataset_files = [];
        $.ajax({
            url: `/${DB_NAME}/files`,
            type: "POST",
            data: {
                "stage": params.stage,
                "cdate": params.cdate,
                "edate": params.edate
            },
            dataType: "json",
            beforeSend: function (xhr, settings) {
                tableFiles.html("<tr><td class='text-center'>" + SPINNER_LOADER_MD + "</td></tr>");
            },
            success: function(response){

                response.root.forEach(function (item) {
                    item.children.forEach(function (data_rows) {
                        let dir = data_rows["root"];
                        let filename = data_rows["name"];
                        let ext = data_rows["ext"];
                        let created_at = data_rows["created_time"];
                        let created_time_for_ordering_table = data_rows["created_time_for_ordering_table"];
                        let type = data_rows["type"];
                        let ui_reference = data_rows["ui_reference"];

                        //EA-872 - 849 files are showing on the File Manager page with the type "844"
                        let searchPos = -1;
                        if (dir){
                            searchPos = dir.search("errors");
                        }
                        if(searchPos >= 0){ // This means it is an errors folder so hide it's type
                            type = '';
                            ui_reference = data_rows["ui_reference"].replace("844s", "");
                        }
                        let actions_icons="";
                        if(is_read_only_user){
                            actions_icons = "<a href='/"+DB_NAME+"/files/"+dir+"/"+filename+"/download' class='ml-2 tt' title='Download File'>" +
                            "<i class='fa fa-download'></i>" +
                            "</a>" +
                            "<a class='ml-2 tt' onclick='APP.get_read_only_user_error();' dir='"+dir+"' filename='"+filename+"' title='Delete File'>" +
                            "<i class='fa fa-trash'></i>" +
                            "</a>";
                        }else{
                            actions_icons = "<a href='/"+DB_NAME+"/files/"+dir+"/"+filename+"/download' class='ml-2 tt' title='Download File'>" +
                            "<i class='fa fa-download'></i>" +
                            "</a>" +
                            "<a class='ml-2 tt' onclick='FILEMANAGER.show_modal_delete_file($(this));' dir='"+dir+"' filename='"+filename+"' title='Delete File'>" +
                            "<i class='fa fa-trash'></i>" +
                            "</a>";
                        }

                        // ticket Ea-1389 show eyes icon for only txt files
                        if (ext === 'txt'){
                            actions_icons = ["<a href='/"+DB_NAME+"/files/"+dir+"/"+filename+"/view' class='tt' title='View File'>" +
                            "<i class='fa fa-eye'></i>" +
                            "</a>", actions_icons].join("");
                        }
                        /*
                            let rows = [
                                "<span class='font-9'>"+filename+"</span>",
                                "<span class='font-10'>"+created_at+"</span>",
                                "<span class='font-11'>"+type+"</span>",
                                "<span class='font-10'>"+ui_reference+"</span>",
                                actions_icons
                            ];
                         */
                        // EA-1663 - File Manager's sort by date not working
                        let rows = [
                            filename,
                            created_at,
                            created_time_for_ordering_table,
                            type,
                            ui_reference,
                            actions_icons
                        ];
                        dataset_files.push(rows);
                    });
                });

            },
            complete: function () {
                FILEMANAGER.loadDataTable(dataset_files);
                params.stage="";
                params.cdate="";
                params.edate="";
            }
        });
    },

    show_modal_delete_file: function (elem) {
        let filename = elem.attr('filename');
        let dir = elem.attr('dir');
        spanFileManagerDeleteFileName.html(filename);
        btnFileManagerDeleteFile.attr('dir', dir);
        btnFileManagerDeleteFile.attr('filename', filename);
        modalFileManagerDeleteFile.modal('show');
    },

    delete_file: function (elem) {
        let dir = elem.attr('dir');
        let filename = elem.attr('filename');

        let loadingText = "<span class='font-11'><i class='fa fa-circle-o-notch fa-spin'></i> Deleting... </span>";
        let originalText = elem.html();

        if (dir && filename){
            $.ajax({
                url: `/${DB_NAME}/files/${dir}/${filename}/delete`,
                data: {},
                type: "POST",
                processData: false,
                contentType: false,
                beforeSend: function (xhr, settings) {
                    if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                    }
                    elem.addClass('disabled').html(loadingText);
                },
                success: function (response) {
                    if( response.result === 'ok'){
                        modalFileManagerDeleteFile.modal('hide');
                        FILEMANAGER.getDirJSONResponse();
                    } else {
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
    },

    filter_link: function (elem, value,type_val) {
        params.stage = value;
        params.cdate = "";
        params.edate = "";
        // ticket 1380 File Manager : Filter and Menus should be in sync.
        let stage_type = FILES_STAGES[type_val];
        selectFileStage.empty();
        $.each(stage_type, function(key, value){
            selectFileStage.append($("<option />").val(key).text(value));
        });
        selectFileType.val(type_val);
        selectFileStage.val(value);
        // end here
        this.getDirJSONResponse(elem);
    },

    refresh_data: function (elem) {
        // ticket 1380 File Manager : Filter and Menus should be in sync.
        selectFileType.val("-1");
        selectFileStage.empty();
        this.getDirJSONResponse(elem);
    },

    filter: function () {
        let stage = selectFileStage.val();
        let cdate = inputCreateDate.val();
        let edate = inputEndDate.val();
        if (stage===null) stage="";
        params.stage=stage;
        params.cdate=cdate;
        params.edate=edate;
        let elem = $(".nav-link.active");
        this.getDirJSONResponse(elem);
    },

    clear: function () {
        selectFileType.val("-1");
        selectFileStage.val("-1");
        inputCreateDate.val("");
        inputEndDate.val("");
    }

};


$(function () {

    let previous;
    selectFileType.focus(function () {
        // Store the current value on focus, before it changes
        previous = this.value;
    }).change(function() {

        let type_val = $(this).val();
        let previous_stage_type = FILES_STAGES;
        var arr = [];
        $.each(previous_stage_type, function(key, value){
                $.each(value,function( index ) {
                    var arr = index.split(":");
                    $('#'+arr[0]).removeClass('active')
                });
            });
        if(type_val != "-1"){
            $('#btnFMFilterAllFiles').removeClass('active');
            let stage_type = FILES_STAGES[type_val];
            selectFileStage.empty();
            let previous_stage_type = FILES_STAGES[previous];
            $.each(previous_stage_type, function(key, value){
                $('#'+key).removeClass('active')
            });
            $.each(stage_type, function(key, value){
                $('#'+key).removeClass('active')
                selectFileStage.append($("<option />").val(key).text(value));
            });
            let stage_val = selectFileStage.val();
            $('#'+stage_val).addClass('active')

        }else{
            selectFileStage.empty();
            let previous_stage_type = FILES_STAGES[previous];
            $.each(previous_stage_type, function(key, value){
                $('#'+key).removeClass('active')
            });
            $('#btnFMFilterAllFiles').addClass('active');
        }

    });

    selectFileStage.change(function() {
        let type_val = selectFileType.val();
        let stage_type = FILES_STAGES[type_val];
        $.each(stage_type, function(key, value){
            $('#'+key).removeClass('active')
        });
        let stage_val = $(this).val();
        $('#'+stage_val).addClass('active')
    });

    // ticket 1143 - Default File Manager filters to Type = 844 and Stage = Waiting for Import
    selectFileType.val('844').trigger('change');
    // ticket 1380 File Manager : Filter and Menus should be in sync.
    $('#844_ERM_intake').addClass('active')

    FILEMANAGER.filter();



});

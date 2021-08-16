from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import calendar
import json

from django.views.decorators.csrf import csrf_exempt

from app.management.utilities.constants import CONFIG_STATUSES
from app.management.utilities.functions import (query_range, convert_string_to_date, bad_json, ok_json)
from app.management.utilities.globals import addGlobalData
from administration.settings import BASE_API_URL, EDI_API_TOKEN
import time
import requests
from django.http import JsonResponse
from rest_framework import status


@login_required(redirect_field_name='ret', login_url='/login')
def view(request):
    """
        EDI API Configurations
    """
    data = {'title': 'EDI API Configurations'}
    addGlobalData(request, data)

    data["customers"] = []
    data["partners"] = []
    customer_response = requests.get(f"{BASE_API_URL}/get_all_customers", params={'token': EDI_API_TOKEN})
    partner_response = requests.get(f"{BASE_API_URL}/get_all_partners", params={'token': EDI_API_TOKEN})

    if customer_response.status_code == status.HTTP_200_OK:
        data["customers"] = customer_response.json()["customers"]

    if partner_response.status_code == status.HTTP_200_OK:
        data["partners"] = partner_response.json()["partners"]

    data["config_statuses"] = CONFIG_STATUSES

    data['header_title'] = f"EDI > Configurations"
    data['menu_option'] = 'menu_edi_configurations'

    return render(request, "edi_module/configurations.html", data)


@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def get_all_configurations(request):
    try:
        search_params = request.POST.get('search_params', request.GET.get('search_params'))
        search_value = request.POST.get('search[value]', '')
        zero_order_column = request.POST.get('order[0][column]', '')
        start = request.POST.get('start', 0)
        length = request.POST.get('length', -1)
        is_export = request.GET.get('is_export', '0')
        response = requests.get(f"{BASE_API_URL}/get_all_configurations", params={'token': EDI_API_TOKEN, 'search_params': search_params, 'search[value]': search_value, 'order[0][column]': zero_order_column, 'start': start, 'length': length})
        if response.status_code == status.HTTP_200_OK:
            r = response.json()
            if r["config_data"]:
                return JsonResponse(r["config_data"])

        return bad_json(message=f'Error getting Configurations data. Status Code: {response.status_code}')

    except Exception as ex:
        print(ex.__str__())
        return bad_json(message='ConnectionError: EDI API is not working')


@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def create(request):
    payload = {
        'id_customer': request.POST['id_customer'],
        'id_customer_isa': request.POST['id_customer_isa'],
        'id_customer_isa_descriptor' : request.POST['id_customer_isa_descriptor'],
        'id_partner' : request.POST['id_partner'],
        'id_partner_acctno' : request.POST['id_partner_acctno'],
        'id_partner_isa' : request.POST['id_partner_isa'],
        'id_partner_isa_descriptor' : request.POST['id_partner_isa_descriptor'],
        'id_partner_isa_test' : request.POST['id_partner_isa_test'],
        'id_partner_gs_descriptor' : request.POST['id_partner_gs_descriptor'],
        'id_main_path' : request.POST['id_main_path'],
        'id_document_types' : request.POST['id_document_types'],
        'id_token' : request.POST['id_token'],
        'id_separator' : request.POST['id_separator'],
        'id_terminator' : request.POST['id_terminator'],
        'id_use_state' : request.POST['id_use_state'],
        'id_sftp' : request.POST['id_sftp'],
        'id_is_enabled' : request.POST['id_is_enabled'],
        'id_single_997_st' : request.POST['id_single_997_st'],
        'id_break_apart_844_files' : request.POST['id_break_apart_844_files'],
        'id_outbound_folder' : request.POST['id_outbound_folder'],
        'id_move_only' : request.POST['id_move_only'],
        'id_error_recipients' : request.POST['id_error_recipients'],
        'id_terms_type_code_id' : request.POST['id_terms_type_code_id'],
        'id_terms_discount_percent_r16' : request.POST['id_terms_discount_percent_r16'],
        'id_terms_discount_days_due' : request.POST['id_terms_discount_days_due'],
        'id_terms_net_days' : request.POST['id_terms_net_days'],
        'id_parameters' : request.POST['id_parameters'],
    }

    response = requests.post(f"{BASE_API_URL}/create_configuration/", json=payload)
    if response.status_code == status.HTTP_200_OK:
        return ok_json(data={'message': "Configuration is added successfully!"})

    return bad_json(message='Error while adding configuration!')


@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def get_by_id(request):
    config_id = request.POST["config_id"]
    payload = {
        'id': config_id
    }
    r = requests.get(f"{BASE_API_URL}/get_configuration_by_id/", json=payload)
    if r.status_code == 200 and r.json()["config"]:
        return ok_json(data={'message': "Configuration found", 'config_data': r.json()["config"]})
    return ok_json(data={'message': "Configuration found", 'config_data': None})


@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def update_status(request):
    config_id = request.POST["config_id"]
    action = request.POST.get('action', '')
    configuration_status = request.POST.get('configuration_status', '')
    payload = {
        'id': config_id,
        'action': action,
        'configuration_status': configuration_status
    }
    r = requests.post(f"{BASE_API_URL}/update_configuration_status/", json=payload)
    if r.status_code == 200:
        return ok_json(data={'message': "Configuration status updated successfully!"})
    return bad_json(message='Error while updating configuration status!')

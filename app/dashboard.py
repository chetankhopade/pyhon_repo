import os

from django.contrib.auth.decorators import login_required
from django.shortcuts import render
import calendar

from django.utils.encoding import smart_str
from django.views.decorators.csrf import csrf_exempt

from app.management.utilities.functions import (query_range, convert_string_to_date, bad_json, ok_json)
from app.management.utilities.globals import addGlobalData
from administration.settings import BASE_API_URL, EDI_API_TOKEN, CLIENTS_DIRECTORY
import time
import requests
from django.http import JsonResponse, HttpResponse
from rest_framework import status
@login_required(redirect_field_name='ret', login_url='/login')
def views(request):
    """
        Dashboard
    """
    data = {'title': 'Dashboard'}
    addGlobalData(request, data)

    # custom dates filters
    start_date = None
    if 's' in request.GET and request.GET['s']:
        data['start_date'] = start_date = convert_string_to_date(request.GET['s'])

    end_date = None
    if 'e' in request.GET and request.GET['e']:
        data['end_date'] = end_date = convert_string_to_date(request.GET['e'])

    # Filter by Custom Dates or Range Filters
    if start_date and end_date:
        query_filter = 'Custom'
    else:
        query_filter = request.GET.get('range', 'YD')
        query = query_range(query_filter)
        data['start_date'] = query[0]
        data['end_date'] = query[1]

    data['query_filter'] = query_filter

    data['current_year'] = current_year = data['today'].year
    data['current_month'] = data['today'].strftime("%B")
    data['last_month'] = calendar.month_name[data['today'].month - 1]
    data['past_years'] = [current_year, current_year - 1, current_year - 2, current_year - 3, current_year - 4,current_year - 5]

    data['header_title'] = f"EDI > Dashboard"
    data['menu_option'] = 'menu_dashboard'

    return render(request, "dashboard/dashboard.html", data)


@login_required(redirect_field_name='ret', login_url='/login')
def get_full_transactions_edi_api(request, *args, **kwargs):
    data = {'title': 'Administration - Get All Transactions Data'}
    addGlobalData(request, data)

    try:
        search_params = request.POST.get('search_params', request.GET.get('search_params'))
        search_value = request.POST.get('search[value]', '')
        zero_order_column = request.POST.get('order[0][column]', '')
        start = request.POST.get('start', 0)
        length = request.POST.get('length', -1)
        is_export = request.GET.get('is_export', '0')
        response = requests.get(f"{BASE_API_URL}/get_all_full_transaction", params={'token': EDI_API_TOKEN,'search_params':search_params,'search[value]':search_value,'order[0][column]':zero_order_column,'start':start,'length':length})
        if response.status_code == status.HTTP_200_OK:
            r = response.json()
            if r["all_data"]:
                return JsonResponse(r["all_data"])

        return bad_json(message=f'Error getting fully Transactions data. Status Code: {response.status_code}')

    except Exception as ex:
        print(ex.__str__())
        return bad_json(message='ConnectionError: API is not working')

@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def file_view(request):

    dirname = request.POST.get('dirname')
    filename = request.POST.get('file_name')
    company_id = request.POST.get('company_id')
    terminator = '~'
    if dirname and filename and company_id:
        file_path = os.path.join(CLIENTS_DIRECTORY,company_id, dirname, filename)
        with open(file_path, 'r') as f:
            file_content = f.read().split(terminator)
        # remove empty elem in the splitted list
        file_content = list(filter(None, file_content))
        file_content = "\n".join(file_content)
        return HttpResponse(file_content, content_type="text/plain")
    else:
        return HttpResponse("NO", content_type="text/plain")
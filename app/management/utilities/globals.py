import datetime

from app.management.utilities.functions import get_ip_address

from app.models import UserProfile



def addGlobalData(request, data):
    data['user'] = request.user
    data['today'] = now = datetime.datetime.now()
    data['ip_address'] = get_ip_address(request)

    # delta to check user inactivity
    request.session['last_activity'] = now.strftime('%Y-%m-%d %H:%M:%S')
    # User Profile (data extensions for User model)
    is_sysadmin = False
    is_owner = False
    if not data['user'].is_anonymous:
        data['my_profile'], _ = UserProfile.objects.get_or_create(user=data['user'])


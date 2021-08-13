import datetime

from django.core.validators import validate_email
from django.contrib.auth import authenticate, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from app.management.utilities.functions import bad_json, ok_json
from app.management.utilities.globals import addGlobalData
from app.models import UserProfile



@login_required(redirect_field_name='ret', login_url='/login')
def view(request):
    """
        User Profile
    """
    data = {'title': 'Profile', 'header_title': 'My Profile'}
    addGlobalData(request, data)

    return render(request, "profile/profile.html", data)



@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def edit(request):
    """
        Edit Profile
    """
    data = {'title': 'Edit Profile'}
    addGlobalData(request, data)

    try:
        with transaction.atomic():

            # About
            title = request.POST['p_title']
            department = request.POST['p_department']
            company = request.POST['p_company']
            timezone = request.POST['p_timezone']

            # Contact
            email = request.POST['p_email']
            phone = request.POST['p_phone']

            # EA-1190 - No Email validation on profile.
            if email:
                try:
                    validate_email(email)
                except Exception:
                    return bad_json(message='Invalid email address')

            # Get User Profile instance
            user_profile, _ = UserProfile.objects.get_or_create(user=data['user'])
            user_profile.phone = phone
            user_profile.title = title
            user_profile.department = department
            user_profile.company = company
            user_profile.timezone = timezone
            user_profile.save()

            if email and user_profile.user.email != email:
                django_user = user_profile.user
                django_user.email = email
                django_user.save()

            return ok_json(data={'result': 'ok', 'redirect_url': reverse('profile')})

    except Exception as ex:
        return bad_json(message=ex.__str__())


@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def avatar(request):
    """
        Profile Avatar
    """
    data = {'title': 'Profile Avatar'}
    addGlobalData(request, data)

    try:
        with transaction.atomic():

            avatar = request.FILES.get('avatar', '')
            if avatar:
                # Get User Profile instance
                user_profile, _ = UserProfile.objects.get_or_create(user=data['user'])
                user_profile.avatar = avatar
                user_profile.save()

            return ok_json(data={'result': 'ok', 'redirect_url': reverse('profile')})

    except Exception as ex:
        return bad_json(message=ex.__str__())



@login_required(redirect_field_name='ret', login_url='/login')
@csrf_exempt
def change_password(request):
    """
        Profile Change Password
    """
    data = {'title': 'Profile Change User Password'}
    addGlobalData(request, data)

    try:
        with transaction.atomic():

            user = request.user

            old_password = request.POST.get('old_password', '')
            if not old_password:
                return bad_json(message='Old Password is required')

            user = authenticate(username=user.username, password=old_password)
            if not user:
                return bad_json(message='Old Password does not match with your current password')

            new_password = request.POST.get('new_password', '')
            if not new_password:
                return bad_json(message='New Password is required')

            confirm_password = request.POST.get('confirm_password', '')
            if not confirm_password:
                return bad_json(message='Confirm Password is required')

            if new_password != confirm_password:
                return bad_json(message='New Passwords do not match')

            user.set_password(new_password)
            user.save()
            update_session_auth_hash(request, user)     # from django 1.8 this function does the magic in user sessions
            return ok_json(data={'result': 'ok', 'redirect_url': reverse('profile')})

    except Exception as ex:
        return bad_json(message=ex.__str__())

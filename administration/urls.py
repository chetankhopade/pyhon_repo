import debug_toolbar
from django.conf.urls.static import static
from django.urls import path, include
from django.contrib import admin
from administration.settings import DEBUG, MEDIA_URL, MEDIA_ROOT, DATABASES, STATIC_URL, STATIC_ROOT
from app import (users,dashboard,profile)
from app.edi_module import configurations
from app.edi_module import edi_dashboard
from app import views as common_views
urlpatterns = [
    # Homepage
    path('', common_views.index, name='index'),
    # Login
    path('login', common_views.login_user, name='login'),
    # Logout
    path('logout', common_views.logout_user, name='logout'),
    # Forgot password
    path('forgot_password', common_views.forgot_password, name='forgot_password'),
    # Signup
    path('signup', common_views.signup, name='signup'),
]

# URLs for Master

urlpatterns += [
    # User Profile
    path('profile', profile.view, name='profile'),
    path('profile/edit', profile.edit, name='profile_edit'),
    path('profile/avatar', profile.avatar, name='profile_avatar'),
    path('profile/change_password', profile.change_password, name='profile_change_password'),
    # Users
    path('users', users.view, name='users'),
    path('users/activation', users.activation, name='users_activation'),
    # EDI
    path(f'edi/dashboard', edi_dashboard.view, name=f'edi_module_dashboard'),
    path(f'edi/dashboard/charts/activity_by_trading_partner', edi_dashboard.chart_activity_by_trading_partner, name='edi_module_dashboard_chart_activity_by_trading_partner'),
    path(f'edi/dashboard/charts/processing_totals_by_doctype', edi_dashboard.chart_processing_totals_by_doctype, name='edi_module_dashboard_chart_processing_totals_by_doctype'),
    path(f'edi/dashboard/charts/current_mtd_throughput', edi_dashboard.chart_current_mtd_throughput, name='edi_module_dashboard_chart_current_mtd_throughput'),
    path(f'edi/dashboard/charts/forecasted_mtd_throughput', edi_dashboard.chart_forecasted_mtd_throughput, name='edi_module_dashboard_chart_forecasted_mtd_throughput'),
]
 # URLs
urlpatterns += [
        # Django admin
        path('admin/', admin.site.urls),
        # Dashboard
        path(f'dashboard', dashboard.views, name=f'dashboard'),
        path(f'dashboard/get_full_transactions_edi_api', dashboard.get_full_transactions_edi_api, name=f'dashboard'),
        # EDI API Configurations
        path(f'configurations', configurations.view, name=f'configurations'),
        path(f'edi/configurations/get_all_configurations', configurations.get_all_configurations, name=f'edi_configurations'),
        path(f'edi/configurations/create', configurations.create, name=f'edi_configurations_create'),
        path(f'edi/configurations/get_by_id', configurations.get_by_id, name=f'edi_configurations_get_by_id'),
        path(f'edi/configurations/update_status', configurations.update_status, name=f'edi_configurations_update_status'),
        path(f'dashboard/view', dashboard.file_view, name=f'file_view'),

    ]


if DEBUG:
    urlpatterns += [
        path('404', common_views.error_404_view, name='404_page'),
        path('500', common_views.error_500_view, name='500_page'),
        path("__debug__/", include(debug_toolbar.urls))
    ]

# Static and Media
urlpatterns += static(STATIC_URL, document_root=STATIC_ROOT)
urlpatterns += static(MEDIA_URL, document_root=MEDIA_ROOT)

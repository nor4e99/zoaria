from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),

    # Auth
    path('api/auth/', include('apps.users.urls')),

    # Core resources
    path('api/pets/', include('apps.pets.urls')),
    path('api/vets/', include('apps.vets.urls')),
    path('api/health/', include('apps.health.urls')),
    path('api/feeding/', include('apps.feeding.urls')),
    path('api/activity/', include('apps.activity.urls')),
    path('api/calendar/', include('apps.calendar_app.urls')),

    # Communication
    path('api/chat/', include('apps.chat.urls')),
    path('api/notifications/', include('apps.notifications.urls')),

    # Commerce
    path('api/payments/', include('apps.payments.urls')),

    # Content
    path('api/hub/', include('apps.hub.urls')),

    # Admin panel API
    path('api/admin-panel/', include('apps.admin_panel.urls')),

    # File uploads (Cloudinary)
    path('api/uploads/', include('apps.uploads.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

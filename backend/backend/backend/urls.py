from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """Root API endpoint that shows available endpoints"""
    return JsonResponse({
        'message': 'Eduwingz API',
        'version': '1.0',
        'endpoints': {
            'admin': '/admin/',
            'users': '/users/',
            'app': '/app/',
            'chat': '/chat/',
            'lessons': '/lessons/',
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('users/', include('users.urls')),
    path('app/', include('app.urls')),
    path('chat/', include('chat.urls')),
    path('lessons/', include('lessons.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
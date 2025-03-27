from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', include("users.urls")),
    # path('quiz/', include("quiz.urls")),
    # path('ckeditor/', include('ckeditor_uploader.urls')),
    # path("ckeditor5/", include('django_ckeditor_5.urls')),    

]


urlpatterns +=static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
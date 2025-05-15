from django.contrib import admin
from users.models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'username', 'email', 'date_joined', 'last_login', 'is_active']
    search_fields = ['user_id', 'username', 'email']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    readonly_fields = ['user_id', 'last_login', 'date_joined']

admin.site.register(User, UserAdmin)
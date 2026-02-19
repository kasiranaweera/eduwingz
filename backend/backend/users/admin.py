from django.contrib import admin
from users.models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ['get_user_display', 'username', 'email', 'date_joined', 'last_login', 'is_active']
    search_fields = ['username', 'email', 'user_id']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    readonly_fields = ['user_id', 'last_login', 'date_joined']
    
    def get_user_display(self, obj):
        return obj.user_id if obj.user_id else obj.email
    get_user_display.short_description = 'User ID'

admin.site.register(User, UserAdmin)
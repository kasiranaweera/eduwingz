from django.contrib import admin
from users.models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ['get_user_display', 'username', 'email', 'date_joined', 'last_login', 'is_active']
    search_fields = ['username', 'email', 'user_id']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    readonly_fields = ['user_id', 'last_login', 'date_joined', 'id']
    ordering = ['-date_joined']
    
    def get_user_display(self, obj):
        try:
            return obj.user_id if obj.user_id else obj.email
        except Exception as e:
            return f"Error: {str(e)}"
    get_user_display.short_description = 'User ID'
    
    def get_list_display_links(self, request, list_display):
        """Make user_id clickable"""
        try:
            return super().get_list_display_links(request, list_display)
        except Exception as e:
            print(f"[ADMIN] Error getting list display links: {str(e)}")
            return ('get_user_display',)

admin.site.register(User, UserAdmin)
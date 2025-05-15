import uuid
from django.utils.text import slugify

def generate_unique_id():
    """Generate a unique identifier"""
    return uuid.uuid4().hex[:12]

def create_profile_id(user_id):
    """Generate a profile ID based on user ID"""
    return f"profile_{user_id}"

def create_user_id(user_id):
    """Generate a user ID"""
    return f"eu_{user_id}"

def generate_slug(text):
    """Generate a slug from text"""
    return slugify(text)
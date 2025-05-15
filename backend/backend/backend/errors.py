from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF
    """
    response = exception_handler(exc, context)
    
    # If response is None, there was an unexpected error
    if response is None:
        return Response(
            {"detail": "An unexpected error occurred."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response

class APIErrorResponse:
    """
    Helper class for standardized error responses
    """
    @staticmethod
    def not_found(message="Resource not found"):
        return Response({"detail": message}, status=status.HTTP_404_NOT_FOUND)
    
    @staticmethod
    def bad_request(message="Bad request", errors=None):
        data = {"detail": message}
        if errors:
            data["errors"] = errors
        return Response(data, status=status.HTTP_400_BAD_REQUEST)
    
    @staticmethod
    def unauthorized(message="Authentication required"):
        return Response({"detail": message}, status=status.HTTP_401_UNAUTHORIZED)
    
    @staticmethod
    def forbidden(message="Permission denied"):
        return Response({"detail": message}, status=status.HTTP_403_FORBIDDEN)
    
    @staticmethod
    def server_error(message="Internal server error"):
        return Response({"detail": message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
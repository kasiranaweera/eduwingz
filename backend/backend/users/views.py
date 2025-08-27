from django.http import JsonResponse
from users.models import User
from users.serializer import MyTokenObtainPairSerializer, RegisterSerializer, UserSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from backend.errors import APIErrorResponse

class MyGetInfoData(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user information"""
        try:
            user = request.user
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except Exception as e:
            return APIErrorResponse.server_error(str(e))

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

@api_view(['GET'])
def getRoutes(request):
    routes = [
        'token/',
        'register/',
        'token/refresh/',
        'test/',
        'info/'
    ]
    return Response(routes)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    if request.method == 'GET':
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response({'response': data}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        try:
            text = request.data.get('text', "Hello buddy")
            data = f'Congratulation your API just responded to POST request with text: {text}'
            return Response({'response': data}, status=status.HTTP_200_OK)
        except Exception as e:
            return APIErrorResponse.bad_request(str(e))
    return APIErrorResponse.bad_request("Invalid request method")
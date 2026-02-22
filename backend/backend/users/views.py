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
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse

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

    def create(self, request, *args, **kwargs):
        try:
            # Use serializer to validate and create user
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            try:
                # build verification link
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                # path: /users/verify-email/<uidb64>/<token>/
                verify_path = f"/users/verify-email/{uid}/{token}/"
                verify_url = request.build_absolute_uri(verify_path)

                subject = 'Verify your email'
                message = f'Hi {user.username},\n\nPlease verify your email by clicking the link below:\n{verify_url}\n\nIf you did not register, please ignore this email.'
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com')

                send_mail(subject, message, from_email, [user.email], fail_silently=True)
            except Exception as e:
                # Log email error but don't fail registration
                print(f"Email sending error: {str(e)}")
                pass

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return APIErrorResponse.bad_request(str(e))


class VerifyEmailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
        except Exception:
            return APIErrorResponse.bad_request("Invalid verification link")

        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return APIErrorResponse.bad_request("Invalid user")

        if default_token_generator.check_token(user, token):
            user.is_email_verified = True
            user.save()
            return Response({"detail": "Email verified successfully"}, status=status.HTTP_200_OK)
        else:
            return APIErrorResponse.bad_request("Invalid or expired token")

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
from django.urls import path, re_path
from . import views


urlpatterns = [
    re_path('^register/$', views.RegisterView.as_view()),

]
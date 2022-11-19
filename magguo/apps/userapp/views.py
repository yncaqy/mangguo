import re

from django.contrib.auth import login
from django.db import DatabaseError

from .models import Users
from django.shortcuts import render, redirect
from django.views.generic.base import View
from magguo.utils.exceptions import Forbbiden

# Create your views here.
class RegisterView(View):
    def get(self, request):
        return render(request, 'userapp/register.html')

    def post(self, request):
        # 接受参数
        username = request.POST.get('username', '')
        password = request.POST.get('password', '')
        phone = request.POST.get('phone', '')

        # 校验参数
        "非空"
        if not all([username, password, phone]):
            raise Forbbiden('缺少必传下参数')
        "匹配用户名"
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{5,8}$', username):
            raise Forbbiden('请输入5-8位用户名')
        "匹配密码"
        if not re.match(r'^[0-9a-zA-Z]{3,8}$', password):
            raise Forbbiden('请输入3-8位密码')
        "匹配手机号码"
        if not re.match(r'^1[3,5,7,8,9]\d{9}$', phone):
            raise Forbbiden('请输入正确手机号码')

        # 保存数据
        try:
            user = Users.objects.create_user(userame=username, password=password, phone=phone)
        except DatabaseError:
            return render(request, 'userapp/register.html', {'reg_error_msg': '注册失败！'})

        # 状态保持
        login(request, user)
        # 返回响应
        return redirect(reversed('newsapp:index'))


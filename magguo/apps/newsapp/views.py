from django import http
from django.core.paginator import EmptyPage
from django.shortcuts import render
from django.views.generic.base import View

from apps.newsapp.models import NewsChannel


# Create your views here.


class IndexView(View):
    def get(self, request, channel_id=1, page_num=1):
        """新闻列表展示功能"""
        try:
            "get NewChannel object"
            newschannel = NewsChannel.objects.get(id=channel_id)
        except NewsChannel.DoesNotExist:
            return http.HttpResponseNotFound('未找到channel_id')
        else:
            "获取当前频道下所有的类别id"
            category_id_list = [category.id for category in newschannel.newscategory_set.all() if category]

        "查看当前频道下所有文章"
        articles = Article.objects.filter(channel_id__in=category_id_list).order_by()

        "创建分页对象"
        try:
            page_articles = page_obj.page(page_num)
        except EmptyPage:
            return http.HttpResponseNotFound('未找到相应的page_num')

        return render(request, 'newsapp/index.html', {'articles': page_articles, 'channel_id': channel_id})

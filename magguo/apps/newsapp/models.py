from django.db import models
from magguo.utils.basemodels import BaseModel
# Create your models here.


class NewsChannel(BaseModel):
    """新闻频道"""
    name = models.CharField(max_length=30, unique=True, verbose_name='name')
    url = models.CharField(default='', null=True, blank=True, max_length=50, verbose_name='频道页面链接')

    class Meta:
        db_table = 't_news_channel'
        verbose_name = '新闻频道'
        verbose_name_plural = verbose_name

    def __str__(self):
        return self.name

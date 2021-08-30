from django.contrib import admin

from .models import EmotionPredictionModel

@admin.register(EmotionPredictionModel)
class EmotionPredictionModel(admin.ModelAdmin):
    pass
from django.urls import path

from .views import *

app_name = "fund_display"
urlpatterns = [
    path("", view=index, name="home"),
    path("populate_languages/", view=populate_languages, name="populate_languages"),
    path("populate_cantons/", view=populate_canton_data, name="populate_cantons"),
    path("api/canton/<str:canton_id>/", view=get_canton_percentages, name='canton_percentages'),
]

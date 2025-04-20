from django.db import models


# Create your models here.
class Account(models.Model):
    account_number = models.CharField(max_length=5)


class AccountTranslation(models.Model):
    account = models.ForeignKey(Account, related_name="translations", on_delete=models.CASCADE)
    language = models.CharField(max_length=10)
    account_name = models.TextField()

    class Meta:
        unique_together = ('account', 'language')

##################################################################################
# account = Account.objects.get(id=1)
# english_translation = account.translations.get(language='en')
# german_translation = account.translations.get(language='de')
##################################################################################


class Canton(models.Model):
    name = models.CharField(max_length=100)


class Percentages(models.Model):
    canton = models.ForeignKey(Canton, related_name="percentages", on_delete=models.CASCADE)
    account = models.ForeignKey(Account, related_name="percentages", on_delete=models.CASCADE)
    percentage = models.FloatField()


from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.translation import gettext as _
import json
import os

from django.views.decorators.csrf import csrf_exempt

from .models import Account, AccountTranslation, Canton, Percentages

# Create your views here.


def index(request):
    with open('fundflow/fund_display/data/languages/shorts.json', 'r', encoding='utf-8') as file:
        canton_data = json.load(file)

    if request.LANGUAGE_CODE == 'en':
        lang_canton = 'de'
    else:
        lang_canton = request.LANGUAGE_CODE[:2]
    cantons = {code.upper(): _(name) for code, name in canton_data[lang_canton].items()}
    if request.method == "GET":

        return render(request, 'fund_display/index.html', {'cantons': cantons, 'entries': None, 'total': 0})
    elif request.method == "POST":
        total = request.POST.get("taxAmount")
        canton = request.POST.get('canton')
        detailed_view = request.POST.get('detailedView') == 'on'

        canton = Canton.objects.filter(name=canton).first()
        canton_percentages = Percentages.objects.filter(canton=canton)
        entries = []
        for item in canton_percentages:
            if len(Account.objects.filter(id=item.account.id).first().account_number) == 1:
                account_translation = AccountTranslation.objects.filter(account_id=item.account, language=request.LANGUAGE_CODE[:2]).first()
                account_name = account_translation.account_name
                percentage = item.percentage
                amount = round(float(total) * percentage / 100, 2)
                entries.append({"name": account_name, "percentage": percentage, "amount": amount})

        return render(request, 'fund_display/index.html', {
            'cantons': cantons,
            'canton': cantons[canton.name.upper()],
            'entries': entries,
            'total': total
        })


@login_required
def populate_canton_data(request):
    json_file_path = 'fundflow/fund_display/data/languages/cantons.json'

    try:
        # Load JSON data
        with open(json_file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        for canton_code, accounts in data.items():
            canton, _ = Canton.objects.get_or_create(name=canton_code)

            for account_number, percentage in accounts.items():
                account, _ = Account.objects.get_or_create(account_number=account_number)

                Percentages.objects.update_or_create(
                    canton=canton,
                    account=account,
                    defaults={'percentage': percentage}
                )

        return JsonResponse({'status': 'success', 'message': 'Data inserted successfully.'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)})


@login_required
def populate_languages(request):
    try:
        languages_path = "fundflow/fund_display/data/languages/"
        for filename in os.listdir(languages_path):
            if filename.endswith(".json"):
                language = os.path.splitext(filename)[0]

                # Load JSON data
                file_path = os.path.join(languages_path, filename)
                with open(file_path, "r", encoding="utf-8") as file:
                    data = json.load(file)

                # Process each account
                for account_number, account_name in data.items():
                    # Get or create the Account object
                    account, _ = Account.objects.get_or_create(account_number=account_number)

                    # Create or update the AccountTranslation object
                    AccountTranslation.objects.update_or_create(
                        account=account,
                        language=language,
                        defaults={"account_name": account_name}
                    )

        return JsonResponse({"message": "Database populated successfully!"}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


def get_canton_percentages(request, canton_id):
    """API endpoint to get percentage distributions for a specific canton"""
    try:
        # Get all percentages for the selected canton
        canton = Canton.objects.filter(name=canton_id)
        canton_percentages = Percentages.objects.filter(canton=canton)

        # Format data in a way that's easy to use in JavaScript
        data = {}

        for item in canton_percentages:
            account_id = item.account_id

            # Try to get translation in user's language or default to first available
            try:
                # Default to English or first available language
                account_translation = AccountTranslation.objects.filter(account_id=account_id).first()
                account_name = account_translation.account_name if account_translation else f"Account {account_id}"

                # Add to our data dictionary
                data[item.account.account_number] = {
                    'name': account_name,
                    'percentage': item.percentage,
                }
            except AccountTranslation.DoesNotExist:
                # If no translation exists, use a placeholder
                data[item.account.account_number] = {
                    'name': f"Account {account_id}",
                    'percentage': item.percentage,
                }

        return JsonResponse({
            'success': True,
            'data': data
        })
    except Canton.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Canton not found'
        })

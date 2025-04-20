import requests
from bs4 import BeautifulSoup

# URL of the webpage
url = "https://www.efv.admin.ch/efv/en/home/themen/finanzstatistik/daten.html"
url_bund = "/dam/efv/de/dokumente/finanzstatistik/daten/fs_bund/bund.xlsx.download.xlsx/bund-de.xlsx"
base_url = "https://www.efv.admin.ch"
save_dir = "data/"

# Fetch the HTML content
response = requests.get(url)
response.raise_for_status()  # Ensure the request was successful

# Parse the HTML content
soup = BeautifulSoup(response.text, 'html.parser')

# Find the specific div by its id
target_div = soup.find('div', id="accordion_8749461321744805672792")

# Extract all links within this div
links = []
if target_div:
    for link in target_div.find_all('a', href=True):
        links.append(link['href'])

# Print the extracted links
links = links[5:]
links.append(url_bund)
for link in links:
    response = requests.get(base_url + link)
    response.raise_for_status()
    filename = save_dir + link.split("/")[-1]
    print(filename)
    with open(filename, "wb") as file:
        file.write(response.content)

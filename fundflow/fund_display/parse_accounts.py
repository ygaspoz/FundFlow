import pandas as pd
import json

file_de = "data/languages/de.xlsx"
file_en = "data/languages/en.xlsx"
file_fr = "data/languages/fr.xlsx"

files = [file_de, file_en, file_fr]

for file in files:
    xls = pd.ExcelFile(file)
    df = pd.read_excel(xls, sheet_name="ausgaben_funk", header=7, converters={0: str})
    json_object = {}
    for index, row in df.iterrows():
        json_object[row.iloc[0].strip()] = row.iloc[1].strip()
    filename = file.split(".")[0][-2:]
    with open(f"data/languages/{filename}.json", "w", encoding="utf-8") as f:
        json.dump(json_object, f, ensure_ascii=False)


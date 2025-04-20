import json
import os
import numpy as np
import pandas as pd

directory = "data/"

total_per = {}
for filename in os.listdir(directory):
    file_path = os.path.join(directory, filename)
    if os.path.isfile(file_path):
        name = filename.split(".")[0].split("_")[-1][:-3]
        xls = pd.ExcelFile(file_path)
        df_ausgaben = pd.read_excel(xls, sheet_name="ausgaben_funk", header=6, converters={0: str})
        df_ausgaben = df_ausgaben.fillna(0)
        total = df_ausgaben.iloc[0, -1]

        df_ausgaben = df_ausgaben[1:]

        percentages = {}

        for index, row in df_ausgaben.iterrows():
            account_number = row.iloc[0]
            percentage = (row.iloc[-1] * 100) / total
            percentages[account_number] = float(percentage)
        total_per[name] = percentages

with open("data/languages/cantons.json", "w") as f:
    json.dump(total_per, f)

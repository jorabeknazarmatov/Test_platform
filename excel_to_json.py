import pandas as pd
import json

def excel_to_json_test(input_file, output_file):
    # Faylni sarlavhasiz o‘qish
    df = pd.read_excel(input_file, header=None)

    result = []

    for _, row in df.iterrows():
        item = {
            "id": int(row[0]),
            "question": str(row[1]),
            "options": [
                str(row[2]),
                str(row[3]),
                str(row[4]),
                str(row[5])
            ],
            "correctAnswer": str(row[2])   # har doim 1-variant
        }
        result.append(item)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)


def excel_to_json_student(input_file, output_file):
    # Excel faylni sarlavhasiz o‘qish
    df = pd.read_excel(input_file, header=None)

    # Ustunlarga mazmunli nom berish
    df.columns = ["group_name", "first_name", "last_name", "middle_name"]

    # Bo'sh satrlarni olib tashlash
    df = df.dropna(how="all")

    # Natija lug‘ati
    result = []

    # Guruhlash
    grouped = df.groupby("group_name")

    for group_name, group_df in grouped:
        students = []

        for _, row in group_df.iterrows():
            students.append({
                "first_name": str(row["first_name"]) if pd.notna(row["first_name"]) else "",
                "last_name": str(row["last_name"]) if pd.notna(row["last_name"]) else "",
                "middle_name": str(row["middle_name"]) if pd.notna(row["middle_name"]) else "",
            })

        result.append({
            "group_name": str(group_name),
            "students": students
        })

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=4)

# Ishlatish:
# excel_to_json_test("test.xlsx", "output.json")
excel_to_json_student("students.xlsx", "students.json")

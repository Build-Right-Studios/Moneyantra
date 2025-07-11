import sys
import casparser
import json

pdf_path = sys.argv[1]
password = sys.argv[2]

json_str = casparser.read_cas_pdf(pdf_path, password, output="json")
print(json_str)

import requests

response = requests.post(
    "http://localhost:8080/api/v1/chart/generate",
    json={"solar_year": 1990, "solar_month": 5, "solar_day": 15, "hour_branch": "子", "gender": "男"}
)
data = response.json()

# Check meta
print("=== META ===")
meta = data["data"]["meta"]
for k, v in meta.items():
    print(f"  {k}: {v}")

print("\n=== MINOR STARS PER PALACE ===")
for p in data["data"]["palaces"]:
    if p['minor_stars']:
        print(f"  {p['branch']}: {p['minor_stars']}")

print("\n=== SPIRITS ===")
for p in data["data"]["palaces"]:
    print(f"  {p['branch']}: 博士={p.get('boshi_spirit','')} | 岁前={p.get('suiqian_spirit','')} | 小限={p.get('xiao_xian','')}")

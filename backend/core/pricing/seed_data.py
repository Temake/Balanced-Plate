"""Starter ingredient catalogue with indicative Lagos prices.

IMPORTANT: these prices are *estimates*, seeded so the costing pipeline has
something to run against on day one. They are written with source=ESTIMATE
precisely so they are easy to find and replace. Before this is shown to real users,
run a manual survey of two or three markets in the launch city and load the real
figures — a plan that quotes a confidently wrong weekly total destroys trust faster
than having no cost feature at all.

Tuple shape:
    (name, aliases, category, unit, price_naira, protein_g_per_unit, kcal_per_unit)

Protein and energy are per *pricing unit*, not per 100g, and are only filled in for
items where they matter for the "cheapest way to hit my protein" query. They are
approximate.
"""

INGREDIENTS = [
    # ---- Staples and swallow -------------------------------------------------
    ("Rice (local)", ["ofada rice", "local rice", "rice"], "staple", "kg", 1800, 70, 3600),
    ("Rice (imported)", ["foreign rice", "polished rice"], "staple", "kg", 2200, 68, 3600),
    ("Garri (yellow)", ["yellow garri", "gari"], "staple", "derica", 700, 3, 1100),
    ("Garri (white)", ["white garri", "ijebu garri"], "staple", "derica", 650, 3, 1100),
    ("Yam", ["yam tuber", "isu"], "staple", "piece", 4500, 20, 4200),
    ("Yam flour (elubo)", ["elubo", "amala flour", "amala"], "staple", "kg", 2200, 40, 3300),
    ("Semolina", ["semo", "semovita"], "staple", "kg", 1900, 110, 3600),
    ("Pounded yam flour", ["poundo", "poundo yam"], "staple", "kg", 2600, 30, 3400),
    ("Cassava flour (lafun)", ["lafun", "fufu flour"], "staple", "kg", 1700, 15, 3400),
    ("Fufu", ["akpu", "cassava fufu"], "staple", "kg", 1400, 12, 1600),
    ("Beans (honey)", ["oloyin beans", "honey beans", "beans"], "staple", "kg", 2600, 220, 3400),
    ("Beans (brown)", ["brown beans", "olotu"], "staple", "kg", 2400, 220, 3400),
    ("Maize", ["corn", "agbado"], "staple", "kg", 1100, 90, 3600),
    ("Pap (ogi)", ["ogi", "akamu", "pap"], "staple", "sachet", 500, 2, 350),
    ("Plantain", ["dodo", "unripe plantain"], "staple", "piece", 700, 2, 220),
    ("Sweet potato", ["sweet potatoes"], "staple", "kg", 1200, 16, 860),
    ("Irish potato", ["potato", "potatoes"], "staple", "kg", 2000, 20, 770),
    ("Spaghetti", ["pasta", "macaroni", "noodles"], "staple", "piece", 1300, 60, 1750),
    ("Agege bread", ["bread", "sliced bread"], "staple", "piece", 1200, 45, 1400),
    ("Wheat flour", ["flour", "wheat meal"], "staple", "kg", 1800, 100, 3600),
    ("Oats", ["oat", "quaker oats"], "staple", "kg", 3500, 130, 3800),
    ("Cocoyam", ["ede", "taro"], "staple", "kg", 1600, 15, 1120),

    # ---- Protein -------------------------------------------------------------
    ("Chicken", ["chicken breast", "broiler", "fowl"], "protein", "kg", 6500, 270, 2150),
    ("Beef", ["meat", "cow meat", "red meat"], "protein", "kg", 7500, 260, 2500),
    ("Goat meat", ["goat", "ewure"], "protein", "kg", 9000, 270, 1430),
    ("Turkey", ["turkey wings"], "protein", "kg", 8500, 290, 1890),
    ("Titus fish", ["mackerel", "titus", "kote"], "protein", "kg", 6000, 240, 2050),
    ("Croaker fish", ["croaker"], "protein", "kg", 7000, 230, 1000),
    ("Catfish", ["point and kill", "obokun"], "protein", "kg", 5500, 180, 1050),
    ("Stockfish", ["okporoko", "panla"], "protein", "piece", 2500, 60, 300),
    ("Dried fish", ["smoked fish", "kpanla"], "protein", "piece", 1500, 45, 250),
    ("Crayfish", ["dried crayfish"], "protein", "derica", 2500, 60, 400),
    ("Egg", ["eggs", "chicken egg"], "protein", "piece", 350, 6, 70),
    ("Sardine", ["tinned fish", "geisha"], "protein", "piece", 1500, 25, 200),
    ("Groundnut", ["peanut", "epa"], "protein", "kg", 3500, 260, 5670),
    ("Soybean", ["soya beans", "soy"], "protein", "kg", 2200, 360, 4460),
    ("Ponmo", ["cow skin", "kanda"], "protein", "kg", 3500, 180, 2240),
    ("Shaki", ["tripe", "towel"], "protein", "kg", 6500, 160, 1100),
    ("Liver", ["cow liver", "chicken liver"], "protein", "kg", 6000, 200, 1350),
    ("Snail", ["big snail", "congo meat"], "protein", "piece", 1200, 15, 90),

    # ---- Vegetables ----------------------------------------------------------
    ("Ugu", ["ugwu", "pumpkin leaf", "fluted pumpkin"], "vegetable", "bunch", 500, 8, 60),
    ("Ewedu", ["jute leaf", "jute leaves"], "vegetable", "bunch", 400, 6, 50),
    ("Bitterleaf", ["onugbu", "bitter leaf"], "vegetable", "bunch", 500, 7, 55),
    ("Waterleaf", ["gbure"], "vegetable", "bunch", 400, 5, 40),
    ("Spinach", ["efo tete", "green"], "vegetable", "bunch", 400, 6, 45),
    ("Scent leaf", ["efirin", "nchanwu", "basil"], "vegetable", "bunch", 300, 3, 25),
    ("Moringa", ["zogale", "moringa leaf"], "vegetable", "bunch", 400, 9, 60),
    ("Okra", ["okro", "ila"], "vegetable", "kg", 1800, 20, 330),
    ("Tomato", ["tomatoes"], "vegetable", "kg", 2500, 9, 180),
    ("Pepper (rodo)", ["ata rodo", "scotch bonnet", "pepper"], "vegetable", "kg", 3000, 20, 400),
    ("Tatashe", ["bell pepper", "red pepper"], "vegetable", "kg", 2200, 10, 260),
    ("Onion", ["onions", "alubosa"], "vegetable", "kg", 1800, 11, 400),
    ("Garden egg", ["igba", "african eggplant"], "vegetable", "kg", 1500, 10, 250),
    ("Cabbage", [], "vegetable", "piece", 1200, 13, 250),
    ("Carrot", ["carrots"], "vegetable", "kg", 1800, 9, 410),
    ("Cucumber", ["cucumbers"], "vegetable", "piece", 400, 2, 45),
    ("Green beans", ["french beans"], "vegetable", "kg", 2500, 18, 310),

    # ---- Fruit ---------------------------------------------------------------
    ("Pawpaw", ["papaya", "ibepe"], "fruit", "piece", 1500, 5, 450),
    ("Mango", ["mangoes", "mangoro"], "fruit", "piece", 300, 1, 200),
    ("Orange", ["oranges", "sweet orange"], "fruit", "piece", 150, 1, 60),
    ("Banana", ["bananas"], "fruit", "piece", 200, 1, 105),
    ("Pineapple", [], "fruit", "piece", 1500, 3, 450),
    ("Watermelon", ["water melon"], "fruit", "piece", 2000, 9, 1350),
    ("Avocado", ["pear", "ube oyibo"], "fruit", "piece", 500, 3, 320),
    ("Guava", ["gova"], "fruit", "piece", 200, 1, 60),
    ("Coconut", [], "fruit", "piece", 800, 13, 1400),
    ("Tiger nut", ["aya", "ofio"], "fruit", "derica", 1000, 12, 600),

    # ---- Oils and fats -------------------------------------------------------
    ("Palm oil", ["red oil", "epo pupa"], "oil", "litre", 3200, 0, 8840),
    ("Groundnut oil", ["peanut oil"], "oil", "litre", 4000, 0, 8840),
    ("Vegetable oil", ["cooking oil", "kings oil"], "oil", "litre", 3800, 0, 8840),
    ("Coconut oil", [], "oil", "litre", 5000, 0, 8840),
    ("Margarine", ["butter", "blue band"], "oil", "piece", 1500, 1, 1500),

    # ---- Seasoning -----------------------------------------------------------
    ("Salt", ["table salt"], "seasoning", "kg", 600, 0, 0),
    ("Seasoning cube", ["maggi", "knorr", "bouillon"], "seasoning", "sachet", 400, 1, 25),
    ("Curry powder", ["curry"], "seasoning", "sachet", 300, 0, 20),
    ("Thyme", [], "seasoning", "sachet", 300, 0, 20),
    ("Iru", ["locust bean", "dawadawa", "ogiri igbo"], "seasoning", "derica", 800, 30, 350),
    ("Ginger", [], "seasoning", "kg", 2500, 18, 800),
    ("Garlic", [], "seasoning", "kg", 3500, 64, 1490),
    ("Uziza", ["uziza leaf", "uziza seed"], "seasoning", "sachet", 400, 2, 30),
    ("Ehuru", ["calabash nutmeg", "african nutmeg"], "seasoning", "sachet", 500, 2, 40),
    ("Suya spice", ["yaji"], "seasoning", "sachet", 500, 3, 60),
    ("Pepper soup spice", ["pepper soup mix"], "seasoning", "sachet", 500, 2, 50),
    ("Tomato paste", ["tin tomato", "gino"], "seasoning", "sachet", 500, 2, 90),
    ("Egusi", ["melon seed", "melon"], "seasoning", "derica", 2500, 70, 1900),
    ("Ogbono", ["bush mango seed", "apon"], "seasoning", "derica", 4000, 30, 1500),

    # ---- Dairy and eggs ------------------------------------------------------
    ("Powdered milk", ["peak milk", "dano", "milk"], "dairy", "sachet", 500, 5, 130),
    ("Evaporated milk", ["tin milk", "three crowns"], "dairy", "piece", 1000, 8, 340),
    ("Yoghurt", ["yogurt", "hollandia"], "dairy", "bottle", 1500, 9, 320),
    ("Wara", ["local cheese", "tofu"], "dairy", "piece", 500, 8, 120),

    # ---- Drinks --------------------------------------------------------------
    ("Zobo leaves", ["hibiscus", "zobo"], "drink", "derica", 600, 3, 150),
    ("Kunu", ["kunu aya"], "drink", "bottle", 500, 3, 200),
    ("Chocolate drink", ["milo", "bournvita"], "drink", "sachet", 400, 2, 90),
    ("Tea", ["lipton", "tea bag"], "drink", "sachet", 100, 0, 2),

    # ---- Other ---------------------------------------------------------------
    ("Sugar", ["granulated sugar"], "other", "kg", 2000, 0, 3870),
    ("Honey", ["pure honey"], "other", "bottle", 4500, 1, 3000),
]


# Anchored on the NBS cost of a healthy diet: ₦1,589 per adult per day (April 2026).
# Low sits below it, Medium around it, Flexible above.
BUDGET_TIERS = [
    (
        "low",
        "Low",
        "Stretch it — beans, garri, eggs, seasonal vegetables.",
        1000,
        0,
    ),
    (
        "medium",
        "Medium",
        "Balanced — chicken or fish a few times a week.",
        1600,
        1,
    ),
    (
        "flexible",
        "Flexible",
        "Comfortable — goat meat, more variety, less compromise.",
        2400,
        2,
    ),
]


AREAS = [
    ("Lagos", "Lagos", 6.5244, 3.3792, True),
    ("Ibadan", "Oyo", 7.3775, 3.9470, False),
    ("Abuja", "FCT", 9.0765, 7.3986, False),
    ("Port Harcourt", "Rivers", 4.8156, 7.0498, False),
    ("Kano", "Kano", 12.0022, 8.5920, False),
    ("Enugu", "Enugu", 6.5244, 7.5186, False),
    ("Benin City", "Edo", 6.3350, 5.6037, False),
    ("Aba", "Abia", 5.1066, 7.3667, False),
]

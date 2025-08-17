import random
from django.core.cache import cache


def generate_otp(email):
    # generate otp
    otp = random.randint(100000, 999999)
    cache.set(f"{email}_otp", otp, timeout=300)

    return otp
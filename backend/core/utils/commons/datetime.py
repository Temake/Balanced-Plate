import math


class DateTime:
    @staticmethod
    def seconds_to_minutes(seconds):
        if seconds is None:
            return None
        return max(1, int(math.ceil(seconds / 60)))

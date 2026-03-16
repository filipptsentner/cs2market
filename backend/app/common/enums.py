from enum import Enum


class SellOrderSort(str, Enum):
    price_asc = "price_asc"
    price_desc = "price_desc"
    created_asc = "created_asc"
    created_desc = "created_desc"


class Currency(str, Enum):
    RUB = "RUB"

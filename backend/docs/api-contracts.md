# API Contracts — CS2 P2P Market MVP

## 1. Назначение документа

Этот документ фиксирует HTTP API-контракты backend-а для MVP p2p-маркета скинов CS2.

Цель документа:

- зафиксировать состав роутов
- определить request / response схемы
- определить коды ответов и ошибки
- синхронизировать frontend, backend и БД
- избежать хаоса при дальнейшей реализации FastAPI-сервиса

Документ опирается на уже согласованную доменную модель:

- `User`
- `Wallet`
- `WalletTransaction`
- `CatalogItem`
- `InventoryItem`
- `SellOrder`
- `Trade`

---

## 2. Общие правила API

### 2.1. Базовые принципы

- API работает в формате `JSON`
- Все денежные значения передаются в **минимальных единицах валюты**
- Для `RUB` это означает хранение и передачу сумм в копейках
- Время передаётся в ISO 8601
- Идентификаторы сущностей — `UUID`
- Для MVP используется одна валюта: `RUB`

Пример:

- `129900` = `1299.00 RUB`

---

### 2.2. Базовый префикс

Рекомендуемый префикс API:

```text
/api/v1

Примеры:
GET /api/v1/catalog-items
GET /api/v1/inventory
POST /api/v1/sell-orders
POST /api/v1/sell-orders/{id}/buy


2.3. Аутентификация
Для текущего MVP полноценная auth-схема может быть временно упрощена.
До внедрения нормальной аутентификации backend может использовать один из двух временных вариантов:
Вариант A
Передавать X-User-Id в заголовке запроса
Вариант B
Использовать dev-заглушку current user в backend
Для контрактов ниже предполагается, что backend уже знает current_user_id.


2.4. Стандарт пагинации
Для list endpoints используется offset-based pagination:
Query params
limit
offset
Response fields
items
total
limit
offset


2.5. Стандарт ошибок
Единый формат ошибки:

{
  "error": {
    "code": "ORDER_NOT_ACTIVE",
    "message": "Sell order is no longer active",
    "details": null
  }
}

Поля
code — машинно-читаемый код ошибки
message — человеко-читаемое описание
details — дополнительные данные, если нужны



3. Доменные перечисления

3.1. User.status
Возможные значения:
active
blocked
deleted

3.2. WalletTransaction.direction
Возможные значения:
credit
debit

3.3. WalletTransaction.status
Возможные значения:
pending
completed
failed
cancelled

3.4. WalletTransaction.type
Возможные значения:
deposit
withdrawal
purchase
sale_income
market_fee
refund
adjustment

3.5. InventoryItem.status
Возможные значения:
available
locked
listed
sold
withdrawn

3.6. SellOrder.status
Возможные значения:
active
cancelled
completed
expired

3.7. Trade.status
Возможные значения:
pending
completed
cancelled
refunded

4. Список роутов MVP
4.1. Read endpoints
GET /api/v1/catalog-items
GET /api/v1/catalog-items/{id}
GET /api/v1/inventory
GET /api/v1/sell-orders
GET /api/v1/wallet
GET /api/v1/wallet/transactions
GET /api/v1/trades

4.2. Mutation endpoints
POST /api/v1/sell-orders
POST /api/v1/sell-orders/{id}/buy
POST /api/v1/sell-orders/{id}/cancel



5. Endpoint: GET /api/v1/catalog-items
5.1. Назначение
Возвращает список предметов каталога.

5.2. Query params
| Name     | Type    | Required | Description                          |
| -------- | ------- | -------- | ------------------------------------ |
| `search` | string  | no       | Поиск по названию / market hash name |
| `rarity` | string  | no       | Фильтр по редкости                   |
| `weapon` | string  | no       | Фильтр по типу оружия                |
| `limit`  | integer | no       | Лимит записей                        |
| `offset` | integer | no       | Смещение                             |

5.3. Response 200
{
  "items": [
    {
      "id": "33333333-3333-3333-3333-333333333331",
      "game": "cs2",
      "market_hash_name": "AK-47 | Redline (Field-Tested)",
      "name": "AK-47 | Redline",
      "slug": "ak-47-redline-ft",
      "weapon": "AK-47",
      "skin_name": "Redline",
      "exterior": "Field-Tested",
      "rarity": "Classified",
      "image_url": "https://example.com/images/ak-redline-ft.png",
      "is_active": true
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}

5.4. Ошибки
400 INVALID_QUERY_PARAMS



6. Endpoint: GET /api/v1/catalog-items/{id}
6.1. Назначение
Возвращает один предмет каталога по catalog_item_id.

6.2. Path params
| Name | Type | Required | Description                     |
| ---- | ---- | -------- | ------------------------------- |
| `id` | uuid | yes      | Идентификатор предмета каталога |

6.3. Response 200
{
  "id": "33333333-3333-3333-3333-333333333331",
  "game": "cs2",
  "market_hash_name": "AK-47 | Redline (Field-Tested)",
  "name": "AK-47 | Redline",
  "slug": "ak-47-redline-ft",
  "weapon": "AK-47",
  "skin_name": "Redline",
  "exterior": "Field-Tested",
  "rarity": "Classified",
  "image_url": "https://example.com/images/ak-redline-ft.png",
  "is_active": true
}

6.4. Ошибки
404 CATALOG_ITEM_NOT_FOUND



7. Endpoint: GET /api/v1/inventory
7.1. Назначение
Возвращает инвентарь текущего пользователя.

7.2. Query params
| Name     | Type    | Required | Description                |
| -------- | ------- | -------- | -------------------------- |
| `status` | string  | no       | Фильтр по статусу предмета |
| `limit`  | integer | no       | Лимит записей              |
| `offset` | integer | no       | Смещение                   |

7.3. Response 200
{
  "items": [
    {
      "inventory_item_id": "44444444-4444-4444-4444-444444444442",
      "catalog_item_id": "33333333-3333-3333-3333-333333333332",
      "asset_id": "asset_demo_awp_asiimov_1",
      "class_id": "class_demo_awp_asiimov",
      "instance_id": "instance_demo_bs",
      "status": "available",
      "price_snapshot": 315000,
      "created_at": "2026-03-14T15:00:00Z",
      "updated_at": "2026-03-14T15:00:00Z",
      "catalog": {
        "id": "33333333-3333-3333-3333-333333333332",
        "name": "AWP | Asiimov",
        "slug": "awp-asiimov-bs",
        "image_url": "https://example.com/images/awp-asiimov-bs.png",
        "rarity": "Covert",
        "weapon": "AWP",
        "skin_name": "Asiimov",
        "exterior": "Battle-Scarred"
      }
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}

7.4. Ошибки
400 INVALID_QUERY_PARAMS



8. Endpoint: GET /api/v1/sell-orders
8.1. Назначение
Возвращает список sell orders.
По умолчанию endpoint должен возвращать только активные ордера, если явно не указан другой фильтр.

8.2. Query params
| Name              | Type    | Required |   Description           |
| ----------------- | ------- |----------|-------------------------|
| `status`          | string  |    no    | Статус ордера           |
| `catalog_item_id` | uuid    |    no    | Фильтр по catalog item  |
| `seller_id`       | uuid    |    no    | Фильтр по продавцу      |
| `sort`            | string  |    no    | `price_asc`, `price_desc`, `created_desc`, `created_asc` |
| `limit`           | integer |    no    | Лимит записей           |
| `offset`          | integer |    no    | Смещение                |

8.3. Response 200
{
  "items": [
    {
      "sell_order_id": "55555555-5555-5555-5555-555555555551",
      "seller_id": "11111111-1111-1111-1111-111111111111",
      "inventory_item_id": "44444444-4444-4444-4444-444444444441",
      "price_amount": 129900,
      "currency": "RUB",
      "status": "active",
      "created_at": "2026-03-14T15:00:00Z",
      "updated_at": "2026-03-14T15:00:00Z",
      "item": {
        "catalog_item_id": "33333333-3333-3333-3333-333333333331",
        "name": "AK-47 | Redline",
        "slug": "ak-47-redline-ft",
        "image_url": "https://example.com/images/ak-redline-ft.png",
        "rarity": "Classified",
        "weapon": "AK-47",
        "skin_name": "Redline",
        "exterior": "Field-Tested"
      }
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}

8.4. Ошибки
400 INVALID_QUERY_PARAMS



9. Endpoint: POST /api/v1/sell-orders
9.1. Назначение
Создаёт ордер продажи для конкретного предмета из инвентаря текущего пользователя.

9.2. Request body
{
  "inventory_item_id": "44444444-4444-4444-4444-444444444442",
  "price_amount": 299900,
  "currency": "RUB"
}

9.3. Request fields
| Name                | Type    | Required | Description                  |
| ------------------- | ------- | -------- | ---------------------------- |
| `inventory_item_id` | uuid    | yes      | Предмет из инвентаря         |
| `price_amount`      | integer | yes      | Цена в копейках              |
| `currency`          | string  | yes      | Валюта, для MVP только `RUB` |

9.4. Validation rules
inventory_item_id должен быть valid UUID
price_amount > 0
currency = 'RUB'

9.5. Response 201
{
  "sell_order_id": "55555555-5555-5555-5555-555555555559",
  "seller_id": "11111111-1111-1111-1111-111111111111",
  "inventory_item_id": "44444444-4444-4444-4444-444444444442",
  "price_amount": 299900,
  "currency": "RUB",
  "status": "active",
  "created_at": "2026-03-14T16:10:00Z"
}

9.6. Ошибки
400 INVALID_REQUEST_BODY
404 INVENTORY_ITEM_NOT_FOUND
409 INVENTORY_ITEM_NOT_OWNED
409 INVENTORY_ITEM_NOT_AVAILABLE
409 ACTIVE_ORDER_ALREADY_EXISTS
422 INVALID_PRICE_AMOUNT

9.7. Бизнес-правила
Backend обязан:
найти inventory_item
проверить, что он принадлежит текущему пользователю
проверить, что inventory_item.status = 'available'
проверить, что активного ордера для этого inventory_item не существует
создать sell_order
изменить inventory_item.status на listed



10. Endpoint: POST /api/v1/sell-orders/{id}/buy
10.1. Назначение
Покупает активный sell order.

10.2. Path params
| Name | Type | Required | Description              |
| ---- | ---- | -------- | ------------------------ |
| `id` | uuid | yes      | Идентификатор sell order |

10.3. Request body
Для MVP допустим пустой body: {}
Опционально на будущее допускается:
{
  "expected_price_amount": 129900
}

10.4. Бизнес-правила
Backend обязан выполнить покупку в одной транзакции БД:
select sell_order for update
проверить, что ордер существует
проверить, что sell_order.status = 'active'
проверить, что покупатель не является продавцом
select inventory_item for update
проверить, что предмет принадлежит продавцу
проверить, что inventory_item.status = 'listed'
select buyer wallet for update
проверить достаточность средств
select seller wallet for update
посчитать комиссию
создать trade
списать средства у покупателя
начислить средства продавцу
создать wallet_transactions
перевести sell_order в completed
передать inventory_item покупателю
завершить транзакцию

10.5. Формула комиссии
Для MVP:
fee_amount = floor(price_amount * 0.02)
seller_receive_amount = price_amount - fee_amount

10.6. Response 200
{
  "trade_id": "66666666-6666-6666-6666-666666666661",
  "sell_order_id": "55555555-5555-5555-5555-555555555551",
  "inventory_item_id": "44444444-4444-4444-4444-444444444441",
  "catalog_item_id": "33333333-3333-3333-3333-333333333331",
  "seller_id": "11111111-1111-1111-1111-111111111111",
  "buyer_id": "22222222-2222-2222-2222-222222222222",
  "price_amount": 129900,
  "fee_amount": 2598,
  "seller_receive_amount": 127302,
  "currency": "RUB",
  "status": "completed",
  "completed_at": "2026-03-14T15:55:52Z"
}

10.7. Ошибки
404 SELL_ORDER_NOT_FOUND
409 ORDER_NOT_ACTIVE
409 CANNOT_BUY_OWN_ORDER
409 INSUFFICIENT_BALANCE
409 INVENTORY_ITEM_INVALID_STATE
500 SELLER_WALLET_NOT_FOUND
500 DATA_INCONSISTENCY



11. Endpoint: POST /api/v1/sell-orders/{id}/cancel
11.1. Назначение
Снимает активный sell order с продажи.

11.2. Path params
| Name | Type | Required | Description              |
| ---- | ---- | -------- | ------------------------ |
| `id` | uuid | yes      | Идентификатор sell order |

11.3. Request body - {}

11.4. Бизнес-правила
Backend обязан:
найти sell_order
проверить, что ордер принадлежит текущему пользователю
проверить, что sell_order.status = 'active'
изменить статус ордера на cancelled
изменить статус предмета inventory_item.status = 'available'

11.5. Response 200
{
  "sell_order_id": "55555555-5555-5555-5555-555555555551",
  "status": "cancelled",
  "closed_at": "2026-03-14T16:20:00Z"
}

11.6. Ошибки
404 SELL_ORDER_NOT_FOUND
403 ORDER_NOT_OWNED_BY_USER
409 ORDER_NOT_ACTIVE




12. Endpoint: GET /api/v1/wallet
12.1. Назначение
Возвращает кошелёк текущего пользователя.

12.2. Response 200
{
  "wallet_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
  "user_id": "22222222-2222-2222-2222-222222222222",
  "currency": "RUB",
  "balance": 370100,
  "hold_balance": 0,
  "updated_at": "2026-03-14T15:55:52Z"
}

12.3. Ошибки
404 WALLET_NOT_FOUND



13. Endpoint: GET /api/v1/wallet/transactions
13.1. Назначение
Возвращает историю денежных транзакций текущего пользователя.

13.2. Query params
| Name     | Type    | Required | Description               |
| -------- | ------- | -------- | ------------------------- |
| `type`   | string  | no       | Фильтр по типу транзакции |
| `status` | string  | no       | Фильтр по статусу         |
| `limit`  | integer | no       | Лимит записей             |
| `offset` | integer | no       | Смещение                  |

13.3. Response 200
{
  "items": [
    {
      "id": "77777777-7777-7777-7777-777777777771",
      "wallet_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
      "user_id": "22222222-2222-2222-2222-222222222222",
      "type": "purchase",
      "direction": "debit",
      "amount": 129900,
      "status": "completed",
      "reference_type": "trade",
      "reference_id": "66666666-6666-6666-6666-666666666661",
      "description": "Purchase of AK-47 | Redline via market trade",
      "created_at": "2026-03-14T15:55:52Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}

13.4. Ошибки
400 INVALID_QUERY_PARAMS
404 WALLET_NOT_FOUND




14. Endpoint: GET /api/v1/trades
14.1. Назначение
Возвращает историю сделок текущего пользователя.

14.2. Query params
| Name     | Type    | Required | Description       |
| -------- | ------- | -------- | ----------------- |
| `role`   | string  | no       | `buyer`, `seller` |
| `status` | string  | no       | Статус сделки     |
| `limit`  | integer | no       | Лимит записей     |
| `offset` | integer | no       | Смещение          |

14.3. Response 200
{
  "items": [
    {
      "trade_id": "66666666-6666-6666-6666-666666666661",
      "sell_order_id": "55555555-5555-5555-5555-555555555551",
      "inventory_item_id": "44444444-4444-4444-4444-444444444441",
      "catalog_item_id": "33333333-3333-3333-3333-333333333331",
      "role": "buyer",
      "seller_id": "11111111-1111-1111-1111-111111111111",
      "buyer_id": "22222222-2222-2222-2222-222222222222",
      "price_amount": 129900,
      "fee_amount": 2598,
      "seller_receive_amount": 127302,
      "currency": "RUB",
      "status": "completed",
      "created_at": "2026-03-14T15:55:52Z",
      "completed_at": "2026-03-14T15:55:52Z",
      "item": {
        "name": "AK-47 | Redline",
        "slug": "ak-47-redline-ft",
        "image_url": "https://example.com/images/ak-redline-ft.png",
        "rarity": "Classified",
        "weapon": "AK-47",
        "exterior": "Field-Tested"
      }
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}

14.4. Ошибки
400 INVALID_QUERY_PARAMS



15. Health endpoint

15.1. Endpoint
GET /api/v1/health

15.2. Назначение
Проверка, что backend поднят.

15.3. Response 200
{
  "status": "ok"
}



16. Сервисный слой
Ниже фиксируется рекомендуемый сервисный слой.

16.1. CatalogService
Методы:
list_catalog_items(filters, limit, offset)
get_catalog_item(catalog_item_id)

16.2. InventoryService
Методы:
get_user_inventory(user_id, filters, limit, offset)

16.3. OrderService
Методы:
list_sell_orders(filters, limit, offset)
create_sell_order(user_id, inventory_item_id, price_amount, currency)
buy_sell_order(buyer_id, sell_order_id)
cancel_sell_order(user_id, sell_order_id)

16.4. WalletService
Методы:
get_wallet(user_id, currency='RUB')
get_wallet_transactions(user_id, filters, limit, offset)

16.5. TradeService
Методы:
get_user_trades(user_id, filters, limit, offset)




17. Репозиторный слой
Ниже фиксируется рекомендуемый набор репозиториев.

17.1. CatalogRepository
получить список catalog items
получить один catalog item

17.2. InventoryRepository
получить список inventory items пользователя
получить inventory item по id
обновить статус inventory item
сменить владельца inventory item

17.3. OrderRepository
получить список sell orders
получить sell order по id
получить sell order по id for update
создать sell order
обновить sell order status

17.4. WalletRepository
получить wallet по user_id и currency
получить wallet for update
изменить баланс wallet
создать wallet transaction
получить список wallet transactions

17.5. TradeRepository
создать trade
получить список trades пользователя



18. Карта ошибок

18.1. Общие ошибки
| HTTP  | Code                   | Meaning                          |
| ----- | ---------------------- | -------------------------------- |
| `400` | `INVALID_QUERY_PARAMS` | Невалидные query-параметры       |
| `400` | `INVALID_REQUEST_BODY` | Невалидное тело запроса          |
| `401` | `UNAUTHORIZED`         | Пользователь не аутентифицирован |
| `403` | `FORBIDDEN`            | Доступ запрещён                  |
| `404` | `NOT_FOUND`            | Сущность не найдена              |
| `409` | `CONFLICT`             | Конфликт состояния               |
| `422` | `VALIDATION_ERROR`     | Ошибка бизнес-валидации          |
| `500` | `INTERNAL_ERROR`       | Внутренняя ошибка сервиса        |

18.2. Доменные ошибки
| HTTP  | Code                           |
| ----- | ------------------------------ |
| `404` | `CATALOG_ITEM_NOT_FOUND`       |
| `404` | `INVENTORY_ITEM_NOT_FOUND`     |
| `404` | `SELL_ORDER_NOT_FOUND`         |
| `404` | `WALLET_NOT_FOUND`             |
| `404` | `TRADE_NOT_FOUND`              |
| `403` | `ORDER_NOT_OWNED_BY_USER`      |
| `409` | `ORDER_NOT_ACTIVE`             |
| `409` | `CANNOT_BUY_OWN_ORDER`         |
| `409` | `INSUFFICIENT_BALANCE`         |
| `409` | `INVENTORY_ITEM_NOT_OWNED`     |
| `409` | `INVENTORY_ITEM_NOT_AVAILABLE` |
| `409` | `INVENTORY_ITEM_INVALID_STATE` |
| `409` | `ACTIVE_ORDER_ALREADY_EXISTS`  |
| `422` | `INVALID_PRICE_AMOUNT`         |
| `500` | `SELLER_WALLET_NOT_FOUND`      |
| `500` | `DATA_INCONSISTENCY`           |




19. Транзакционные гарантии для покупки
Для POST /api/v1/sell-orders/{id}/buy backend обязан:
использовать одну транзакцию БД
использовать SELECT ... FOR UPDATE
не допускать двойной покупки одного и того же ордера
не допускать ухода баланса в минус
не допускать рассинхронизации между trade, wallets, wallet_transactions, sell_orders, inventory_items



20. Что не входит в текущий MVP API
Ниже перечислено то, что сознательно не входит в текущую версию:
пополнение баланса через платёжный шлюз
вывод средств
поддержка нескольких валют
buy orders
торговый стакан
сложные статусы доставки предмета
Steam escrow / Steam bot flow
dispute / arbitration
рейтинги пользователей
отзывы
уведомления
админская панель
market wallet как отдельная сущность



21. Минимальный порядок реализации
Рекомендуемый порядок разработки:
Шаг 1
GET /api/v1/health

Шаг 2
GET /api/v1/catalog-items
GET /api/v1/inventory
GET /api/v1/sell-orders

Шаг 3
POST /api/v1/sell-orders
POST /api/v1/sell-orders/{id}/cancel

Шаг 4
GET /api/v1/wallet
GET /api/v1/wallet/transactions
GET /api/v1/trades

Шаг 5
POST /api/v1/sell-orders/{id}/buy



22. Итог
Этот документ является канонической спецификацией backend API для MVP.
Любая реализация backend-а должна соответствовать:
схемам запросов
схемам ответов
бизнес-правилам
транзакционным требованиям
кодам ошибок
При расхождении между кодом и документом документ должен быть обновлён осознанно, а не “по факту”.



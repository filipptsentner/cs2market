POST /sell-orders/:id/buy


1. Начать DB transaction
begin; 


2. Заблокировать ордер
Нужно взять ордер с блокировкой:
select
    so.id,
    so.seller_id,
    so.inventory_item_id,
    so.price_amount,
    so.currency,
    so.status
from sell_orders so
where so.id = $1
for update;

Что проверяешь
Если ордер не найден → 404 Not Found
Если status != 'active' → ошибка вроде:
409 Order is no longer active


Шаг 3. Проверить, что покупатель не продавец
Если: buyer_id == seller_id
то вернуть:
409 You cannot buy your own order


4. Заблокировать предмет инвентаря
Нужно взять inventory_item тоже с блокировкой:

select
    ii.id,
    ii.user_id,
    ii.catalog_item_id,
    ii.status
from inventory_items ii
where ii.id = $1
for update;


Что проверяешь
inventory_items.user_id должен быть равен seller_id
inventory_items.status должен быть listed
Если нет — откат и ошибка консистентности.
Это не пользовательская ошибка, а уже ближе к 409 / 500, в зависимости от политики API.


5. Заблокировать кошелёк покупателя
select
    w.id,
    w.user_id,
    w.balance,
    w.currency
from wallets w
where w.user_id = $1
  and w.currency = 'RUB'
for update;


Проверяешь

кошелёк существует
balance >= price_amount
Если денег не хватает:
409 Insufficient balance


6. Заблокировать кошелёк продавца
select
    w.id,
    w.user_id,
    w.balance,
    w.currency
from wallets w
where w.user_id = $1
  and w.currency = 'RUB'
for update;

Если кошелька нет — это уже внутренняя проблема системы.


Как считать деньги
Для MVP формула простая.
Допустим:
price_amount = 129900
комиссия = 2%
Тогда:
fee_amount = floor(price_amount * 0.02)
seller_receive_amount = price_amount - fee_amount

Пример:
129900 * 0.02 = 2598
продавец получает 127302


7. Списать деньги у покупателя
update wallets
set
    balance = balance - $1,
    updated_at = now()
where id = $2;

Где:
$1 = price_amount
$2 = buyer_wallet_id



8. Начислить деньги продавцу
update wallets
set
    balance = balance + $1,
    updated_at = now()
where id = $2;

Где:
$1 = seller_receive_amount
$2 = seller_wallet_id



9. Записать транзакцию покупателя
insert into wallet_transactions (
    id,
    wallet_id,
    user_id,
    type,
    direction,
    amount,
    status,
    reference_type,
    reference_id,
    description
)
values (
    gen_random_uuid(),
    $1,
    $2,
    'purchase',
    'debit',
    $3,
    'completed',
    'sell_order',
    $4,
    $5
);

Здесь:
$1 = buyer_wallet_id
$2 = buyer_id
$3 = price_amount
$4 = sell_order_id
$5 = 'Purchase of item via market order'


10. Записать транзакцию продавца

insert into wallet_transactions (
    id,
    wallet_id,
    user_id,
    type,
    direction,
    amount,
    status,
    reference_type,
    reference_id,
    description
)
values (
    gen_random_uuid(),
    $1,
    $2,
    'sale_income',
    'credit',
    $3,
    'completed',
    'sell_order',
    $4,
    $5
);

Где $3 = seller_receive_amount.



11. Записать комиссию маркета
Есть два пути:
Вариант 1 — записывать только как факт в wallet_transactions
Например отдельной тех-транзакцией без market-wallet.
Но это грязновато.

Вариант 2 — пока просто хранить комиссию в trades
Для MVP этого достаточно.

Рекомендация сейчас:
не усложнять и не делать отдельный market wallet,
а пока просто сохранять fee_amount в trades.



12. Создать trade

insert into trades (
    id,
    sell_order_id,
    inventory_item_id,
    catalog_item_id,
    seller_id,
    buyer_id,
    price_amount,
    fee_amount,
    seller_receive_amount,
    currency,
    status,
    created_at,
    completed_at
)
values (
    gen_random_uuid(),
    $1,
    $2,
    $3,
    $4,
    $5,
    $6,
    $7,
    $8,
    'RUB',
    'completed',
    now(),
    now()
);


13. Закрыть ордер
update sell_orders
set
    status = 'completed',
    closed_at = now(),
    updated_at = now()
where id = $1;


14. Передать предмет покупателю
update inventory_items
set
    user_id = $1,
    status = 'available',
    updated_at = now()
where id = $2;

Где:
$1 = buyer_id
$2 = inventory_item_id

commit;









# Buy Sell Order Flow

## Input
- sell_order_id
- buyer_id

## Steps
1. Start DB transaction
2. Select sell_order by id FOR UPDATE
3. Ensure sell_order exists
4. Ensure sell_order.status = 'active'
5. Ensure buyer_id != seller_id
6. Select inventory_item FOR UPDATE
7. Ensure inventory_item exists
8. Ensure inventory_item.user_id = seller_id
9. Ensure inventory_item.status = 'listed'
10. Select buyer wallet FOR UPDATE
11. Ensure buyer wallet exists
12. Ensure buyer wallet.balance >= sell_order.price_amount
13. Select seller wallet FOR UPDATE
14. Ensure seller wallet exists
15. Calculate fee_amount
16. Calculate seller_receive_amount
17. Decrease buyer wallet balance
18. Increase seller wallet balance
19. Insert buyer wallet_transaction(type='purchase')
20. Insert seller wallet_transaction(type='sale_income')
21. Insert trade
22. Update sell_order.status = 'completed'
23. Update inventory_item.user_id = buyer_id
24. Update inventory_item.status = 'available'
25. Commit transaction

## On any error
- rollback transaction



Нужно определить:
какие модули есть в backend
какие роуты нужны для MVP
какие данные они принимают и возвращают
какие сервисы стоят за этими роутами

Рекомендуемый состав модулей
Для MVP достаточно вот такого разбиения:
Модули
users
wallets
catalog
inventory
orders
trades
db / database
common


Что за что отвечает
users
Пока почти пустой. Нужен как доменная опора.

wallets
Работа с балансом и историей транзакций.

catalog
Справочник предметов.

inventory
Инвентарь конкретного пользователя.

orders
Создание ордера, список ордеров, покупка ордера.

trades
История завершённых сделок.

database
Подключение к PostgreSQL, транзакции, репозитории.

common
Ошибки, enums, utils, base schemas.



Какие роуты нужны для MVP
Вот минимальный набор.

Catalog
GET /catalog-items
GET /catalog-items/:id
Inventory
GET /inventory
Sell orders
GET /sell-orders
POST /sell-orders
POST /sell-orders/:id/buy
POST /sell-orders/:id/cancel
Wallets
GET /wallet
GET /wallet/transactions
Trades
GET /trades



Какие роуты реально критичны уже сейчас
Если резать совсем по живому, то первыми делай только это:
GET /catalog-items
GET /inventory
GET /sell-orders
POST /sell-orders
POST /sell-orders/:id/buy
Это и есть боевой MVP-контур.



Контракты API
Ниже уже конкретно.

5.1. GET /catalog-items
Назначение
Показать каталог предметов.

Query params
Можно сразу заложить:
search
rarity
weapon
limit
offset

Response
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



5.2. GET /inventory
Назначение
Вернуть инвентарь текущего пользователя.
Response
{
  "items": [
    {
      "inventory_item_id": "44444444-4444-4444-4444-444444444442",
      "catalog_item_id": "33333333-3333-3333-3333-333333333332",
      "asset_id": "asset_demo_awp_asiimov_1",
      "status": "available",
      "price_snapshot": 315000,
      "catalog": {
        "name": "AWP | Asiimov",
        "slug": "awp-asiimov-bs",
        "image_url": "https://example.com/images/awp-asiimov-bs.png",
        "rarity": "Covert",
        "weapon": "AWP",
        "exterior": "Battle-Scarred"
      }
    }
  ]
}



5.3. GET /sell-orders
Назначение
Показать список активных ордеров.
Query params
limit
offset
sort=price_asc|price_desc|created_desc
catalog_item_id
seller_id — опционально, для личного кабинета
Response
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
      "item": {
        "catalog_item_id": "33333333-3333-3333-3333-333333333331",
        "name": "AK-47 | Redline",
        "slug": "ak-47-redline-ft",
        "image_url": "https://example.com/images/ak-redline-ft.png",
        "rarity": "Classified",
        "weapon": "AK-47",
        "exterior": "Field-Tested"
      }
    }
  ],
  "total": 1
}



5.4. POST /sell-orders
Назначение
Создать ордер на продажу предмета из своего инвентаря.

Request body
{
  "inventory_item_id": "44444444-4444-4444-4444-444444444442",
  "price_amount": 299900,
  "currency": "RUB"
}
Что делает backend
проверяет, что предмет принадлежит пользователю
проверяет, что статус available
создаёт sell_order
переводит inventory_item.status в listed

Success response
{
  "sell_order_id": "new-order-uuid",
  "status": "active"
}

Ошибки
404 inventory item not found
409 inventory item is not available
409 active order already exists for this inventory item
422 invalid price


5.5. POST /sell-orders/:id/buy
Назначение
Купить активный ордер.
Request body
Для MVP можно вообще пустой body:
{}

или так:
{
  "expected_price_amount": 129900
}
Зачем expected_price_amount
Это полезно, чтобы фронт мог защититься от ситуации:
пользователь видел одну цену
за это время цена изменилась

Для вашего MVP ордер immutable по цене, так что пока можно без этого.

Success response
{
  "trade_id": "66666666-6666-6666-6666-666666666661",
  "sell_order_id": "55555555-5555-5555-5555-555555555551",
  "inventory_item_id": "44444444-4444-4444-4444-444444444441",
  "price_amount": 129900,
  "fee_amount": 2598,
  "seller_receive_amount": 127302,
  "currency": "RUB",
  "status": "completed"
}
Ошибки
404 sell order not found
409 order is no longer active
409 cannot buy your own order
409 insufficient balance
500 inconsistent order state

5.6. POST /sell-orders/:id/cancel
Назначение
Продавец снимает ордер.
Что делает backend
проверяет владельца ордера
проверяет, что ордер active
меняет sell_order.status = cancelled
меняет inventory_item.status = available

Response
{
  "sell_order_id": "55555555-5555-5555-5555-555555555551",
  "status": "cancelled"
}


5.7. GET /wallet
Response
{
  "wallet_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
  "currency": "RUB",
  "balance": 370100,
  "hold_balance": 0
}


5.8. GET /wallet/transactions
Response
{
  "items": [
    {
      "id": "77777777-7777-7777-7777-777777777771",
      "type": "purchase",
      "direction": "debit",
      "amount": 129900,
      "status": "completed",
      "reference_type": "trade",
      "reference_id": "66666666-6666-6666-6666-666666666661",
      "created_at": "2026-03-14T15:55:52Z"
    }
  ]
}


5.9. GET /trades
Назначение
История сделок текущего пользователя.
Response
{
  "items": [
    {
      "trade_id": "66666666-6666-6666-6666-666666666661",
      "sell_order_id": "55555555-5555-5555-5555-555555555551",
      "role": "buyer",
      "price_amount": 129900,
      "fee_amount": 2598,
      "seller_receive_amount": 127302,
      "currency": "RUB",
      "status": "completed",
      "created_at": "2026-03-14T15:55:52Z",
      "item": {
        "name": "AK-47 | Redline",
        "slug": "ak-47-redline-ft",
        "image_url": "https://example.com/images/ak-redline-ft.png"
      }
    }
  ]
}


6. Как разложить backend по слоям
Вот правильный MVP-скелет.
Слои
Router / Controller
Service
Repository
DB
Router / Controller
Принимает HTTP-запрос, валидирует вход, вызывает сервис.
Примеры:
catalog_router
inventory_router
orders_router
Service
Здесь бизнес-логика.
Примеры:
CatalogService
InventoryService
OrderService
WalletService

Именно OrderService будет содержать:
create_sell_order
cancel_sell_order
buy_sell_order
Repository
Тонкий слой доступа к БД.
Примеры:
CatalogRepository
InventoryRepository
WalletRepository
OrderRepository
TradeRepository

7. Какие сервисные методы должны быть
CatalogService
list_catalog_items(filters)
get_catalog_item(item_id)
InventoryService
get_user_inventory(user_id)
OrderService
list_active_orders(filters)
create_sell_order(user_id, inventory_item_id, price_amount, currency)
cancel_sell_order(user_id, sell_order_id)
buy_sell_order(buyer_id, sell_order_id)
WalletService
get_wallet(user_id, currency='RUB')
get_wallet_transactions(user_id, limit, offset)
TradeService
get_user_trades(user_id, limit, offset)

8. Рекомендуемая структура папок
Если делать на FastAPI, я бы рекомендовал так:
backend/
  app/
    main.py
    api/
      routers/
        catalog.py
        inventory.py
        orders.py
        wallets.py
        trades.py
    core/
      config.py
      db.py
      errors.py
    models/
      dto/
        catalog.py
        inventory.py
        orders.py
        wallets.py
        trades.py
    repositories/
      catalog.py
      inventory.py
      orders.py
      wallets.py
      trades.py
    services/
      catalog.py
      inventory.py
      orders.py
      wallets.py
      trades.py
    common/
      enums.py
      pagination.py

Это хороший MVP-скелет.
9. Что должно быть первым в реализации
Не надо браться сразу за покупку. Порядок лучше такой:
Сначала read endpoints
GET /catalog-items
GET /inventory
GET /sell-orders
Потому что они:

проще
быстро оживляют фронт
позволяют проверить SQL и DTO

Потом mutation endpoints
POST /sell-orders
POST /sell-orders/:id/cancel
POST /sell-orders/:id/buy

10. Что делать прямо сейчас
На текущем шаге нужно зафиксировать API-контракты.
То есть создай у себя документ вроде:

backend/docs/api-contracts.md
И занеси туда:
список роутов
request / response schemas
коды ошибок
названия сервисов
Это будет опорой для кода.

11. Что будет следующим шагом
После фиксации API идём уже в реализацию каркаса приложения.
Следующий правильный шаг:
Шаг 6 — создать backend-скелет проекта под FastAPI
Туда войдёт:
структура папок
main.py
подключение роутеров
конфиг БД
базовое подключение к PostgreSQL
health endpoint
Это уже будет первый настоящий код backend-а.
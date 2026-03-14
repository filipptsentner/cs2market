create extension if not exists "pgcrypto";

create table users (
    id uuid primary key default gen_random_uuid(),
    username varchar(50) not null,
    email varchar(255),
    steam_id varchar(64),
    status varchar(20) not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint users_status_check
        check (status in ('active', 'blocked', 'deleted'))
);

create unique index users_email_uq
    on users (lower(email))
    where email is not null;

create unique index users_steam_id_uq
    on users (steam_id)
    where steam_id is not null;


create table wallets (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    currency varchar(10) not null default 'RUB',
    balance bigint not null default 0,
    hold_balance bigint not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint wallets_balance_check check (balance >= 0),
    constraint wallets_hold_balance_check check (hold_balance >= 0)
);

create unique index wallets_user_currency_uq
    on wallets (user_id, currency);


create table wallet_transactions (
    id uuid primary key default gen_random_uuid(),
    wallet_id uuid not null references wallets(id) on delete restrict,
    user_id uuid not null references users(id) on delete restrict,
    type varchar(30) not null,
    direction varchar(10) not null,
    amount bigint not null,
    status varchar(20) not null default 'completed',
    reference_type varchar(30),
    reference_id uuid,
    description text,
    created_at timestamptz not null default now(),

    constraint wallet_transactions_direction_check
        check (direction in ('credit', 'debit')),

    constraint wallet_transactions_status_check
        check (status in ('pending', 'completed', 'failed', 'cancelled')),

    constraint wallet_transactions_amount_check
        check (amount > 0),

    constraint wallet_transactions_type_check
        check (type in (
            'deposit',
            'withdrawal',
            'purchase',
            'sale_income',
            'market_fee',
            'refund',
            'adjustment'
        ))
);

create index wallet_transactions_wallet_id_created_at_idx
    on wallet_transactions (wallet_id, created_at desc);

create index wallet_transactions_user_id_created_at_idx
    on wallet_transactions (user_id, created_at desc);

create index wallet_transactions_reference_idx
    on wallet_transactions (reference_type, reference_id);


create table catalog_items (
    id uuid primary key default gen_random_uuid(),
    game varchar(20) not null default 'cs2',
    market_hash_name varchar(255) not null,
    name varchar(255) not null,
    slug varchar(255) not null,
    weapon varchar(100),
    skin_name varchar(100),
    exterior varchar(50),
    rarity varchar(50),
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create unique index catalog_items_slug_uq
    on catalog_items (slug);

create unique index catalog_items_market_hash_name_uq
    on catalog_items (market_hash_name);

create index catalog_items_game_active_idx
    on catalog_items (game, is_active);


create table inventory_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    catalog_item_id uuid not null references catalog_items(id) on delete restrict,
    asset_id varchar(64),
    class_id varchar(64),
    instance_id varchar(64),
    price_snapshot bigint,
    status varchar(20) not null default 'available',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint inventory_items_status_check
        check (status in ('available', 'locked', 'listed', 'sold', 'withdrawn')),

    constraint inventory_items_price_snapshot_check
        check (price_snapshot is null or price_snapshot >= 0)
);

create index inventory_items_user_id_status_idx
    on inventory_items (user_id, status);

create index inventory_items_catalog_item_id_idx
    on inventory_items (catalog_item_id);

create unique index inventory_items_asset_id_uq
    on inventory_items (asset_id)
    where asset_id is not null;


create table sell_orders (
    id uuid primary key default gen_random_uuid(),
    seller_id uuid not null references users(id) on delete restrict,
    inventory_item_id uuid not null references inventory_items(id) on delete restrict,
    price_amount bigint not null,
    currency varchar(10) not null default 'RUB',
    status varchar(20) not null default 'active',
    expires_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint sell_orders_status_check
        check (status in ('active', 'cancelled', 'completed', 'expired')),

    constraint sell_orders_price_amount_check
        check (price_amount > 0)
);

create index sell_orders_status_price_idx
    on sell_orders (status, price_amount);

create index sell_orders_seller_id_status_idx
    on sell_orders (seller_id, status);

create unique index sell_orders_one_active_per_inventory_item_uq
    on sell_orders (inventory_item_id)
    where status = 'active';


create table trades (
    id uuid primary key default gen_random_uuid(),
    sell_order_id uuid not null references sell_orders(id) on delete restrict,
    inventory_item_id uuid not null references inventory_items(id) on delete restrict,
    catalog_item_id uuid not null references catalog_items(id) on delete restrict,
    seller_id uuid not null references users(id) on delete restrict,
    buyer_id uuid not null references users(id) on delete restrict,
    price_amount bigint not null,
    fee_amount bigint not null default 0,
    seller_receive_amount bigint not null,
    currency varchar(10) not null default 'RUB',
    status varchar(20) not null default 'completed',
    created_at timestamptz not null default now(),
    completed_at timestamptz not null default now(),

    constraint trades_status_check
        check (status in ('pending', 'completed', 'cancelled', 'refunded')),

    constraint trades_price_amount_check
        check (price_amount > 0),

    constraint trades_fee_amount_check
        check (fee_amount >= 0),

    constraint trades_seller_receive_amount_check
        check (seller_receive_amount >= 0),

    constraint trades_buyer_seller_diff_check
        check (buyer_id <> seller_id),

    constraint trades_amount_consistency_check
        check (seller_receive_amount = price_amount - fee_amount)
);

create unique index trades_sell_order_id_uq
    on trades (sell_order_id);

create index trades_buyer_id_created_at_idx
    on trades (buyer_id, created_at desc);

create index trades_seller_id_created_at_idx
    on trades (seller_id, created_at desc);

create index trades_catalog_item_id_created_at_idx
    on trades (catalog_item_id, created_at desc);
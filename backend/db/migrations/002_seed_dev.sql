insert into users (id, username, email, steam_id, status)
values
    ('11111111-1111-1111-1111-111111111111', 'seller_demo', 'seller@example.com', 'steam_seller_demo', 'active'),
    ('22222222-2222-2222-2222-222222222222', 'buyer_demo', 'buyer@example.com', 'steam_buyer_demo', 'active')
on conflict do nothing;


insert into wallets (id, user_id, currency, balance, hold_balance)
values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '11111111-1111-1111-1111-111111111111', 'RUB', 0, 0),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', 'RUB', 500000, 0)
on conflict do nothing;


insert into catalog_items (
    id,
    game,
    market_hash_name,
    name,
    slug,
    weapon,
    skin_name,
    exterior,
    rarity,
    image_url,
    is_active
)
values
    (
        '33333333-3333-3333-3333-333333333331',
        'cs2',
        'AK-47 | Redline (Field-Tested)',
        'AK-47 | Redline',
        'ak-47-redline-ft',
        'AK-47',
        'Redline',
        'Field-Tested',
        'Classified',
        'https://example.com/images/ak-redline-ft.png',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333332',
        'cs2',
        'AWP | Asiimov (Battle-Scarred)',
        'AWP | Asiimov',
        'awp-asiimov-bs',
        'AWP',
        'Asiimov',
        'Battle-Scarred',
        'Covert',
        'https://example.com/images/awp-asiimov-bs.png',
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'cs2',
        'M4A1-S | Decimator (Minimal Wear)',
        'M4A1-S | Decimator',
        'm4a1-s-decimator-mw',
        'M4A1-S',
        'Decimator',
        'Minimal Wear',
        'Classified',
        'https://example.com/images/m4a1s-decimator-mw.png',
        true
    )
on conflict do nothing;


insert into inventory_items (
    id,
    user_id,
    catalog_item_id,
    asset_id,
    class_id,
    instance_id,
    price_snapshot,
    status
)
values
    (
        '44444444-4444-4444-4444-444444444441',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333331',
        'asset_demo_ak_redline_1',
        'class_demo_ak_redline',
        'instance_demo_ft',
        125000,
        'listed'
    ),
    (
        '44444444-4444-4444-4444-444444444442',
        '11111111-1111-1111-1111-111111111111',
        '33333333-3333-3333-3333-333333333332',
        'asset_demo_awp_asiimov_1',
        'class_demo_awp_asiimov',
        'instance_demo_bs',
        315000,
        'available'
    ),
    (
        '44444444-4444-4444-4444-444444444443',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        'asset_demo_m4a1s_decimator_1',
        'class_demo_m4a1s_decimator',
        'instance_demo_mw',
        98000,
        'available'
    )
on conflict do nothing;


insert into sell_orders (
    id,
    seller_id,
    inventory_item_id,
    price_amount,
    currency,
    status
)
values
    (
        '55555555-5555-5555-5555-555555555551',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444441',
        129900,
        'RUB',
        'active'
    )
on conflict do nothing;
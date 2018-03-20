# woocommerce-data-generator

Generates Orders for WooCommerce Store

Example .env file

```

WOOCOMMERCE_CONSUMER_KEY="ck_xxxxxxxxxxx"
WOOCOMMERCE_CONSUMER_SECRET="cs_xxxxxxxxxxx"
WOOCOMMERCE_URL = "http://mywoo-store.com"
CUSTOMER_DATA_URL="https://my.api.mockaroo.com/customer_data.json?key=xxxxx"
PRODUCT_DATA_URL="https://my.api.mockaroo.com/product_data.json?key=xxxxx"

```

Mockaroo Schema's in Data dir

**Put an .env file in the project folder and run the script**

```

node entry.js --generate order/customer/product --count 100


```
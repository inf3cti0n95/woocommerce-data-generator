import { generateRandomInt, getLine, getFileLineCount } from "./utils";
import {
    CUSTOMER_DATA_URL,
    PRODUCT_DATA_URL,
    WOOCOMMERCE_CONSUMER_KEY,
    WOOCOMMERCE_CONSUMER_SECRET,
    WOOCOMMERCE_URL,
} from "./config";
const WooCommerce = require('woocommerce-api');


export default class WooCommerceSystem {

    constructor(count) {
        this.dummyCustomers = [];
        this.dummyProducts = [];
        this.count = count;
        this.wooCommerce = new WooCommerce({
            url: WOOCOMMERCE_URL,
            consumerKey: WOOCOMMERCE_CONSUMER_KEY,
            consumerSecret: WOOCOMMERCE_CONSUMER_SECRET,
            wpAPI: true,
            version: 'wc/v2'
        });
    }

    async initializeCustomers() {
        let customers = await fetch(`${CUSTOMER_DATA_URL}&count=${this.count}`).then(resp => resp.json());
        this.dummyCustomers = customers;
        return this.dummyCustomers
    }

    async initializeProducts() {
        let products = await fetch(`${PRODUCT_DATA_URL}&count=${this.count}`).then(resp => resp.json());
        this.dummyProducts = products;
        return this.dummyProducts
    }

    async getCustomerId() { }
    async getProductId() { }

    getCustomer() {
        return this.dummyCustomers.pop()
    }
    getProduct() {
        return this.dummyProducts.pop()
    }

    async postCustomer() {
        let customerData = this.getCustomer()
        let data = {
            email: generateRandomInt(1, 1000) + customerData["email"],
            first_name: customerData["first_name"],
            last_name: customerData["last_name"],
            username: generateRandomInt(1, 1000) + customerData["first_name"] + "." + customerData["last_name"],
            password: "abcd",
            billing: {
                first_name: customerData["first_name"],
                last_name: customerData["last_name"],
                company: customerData["company"],
                address_1: customerData["address"],
                address_2: '',
                city: customerData["city"],
                state: customerData["state"],
                postcode: customerData["zip"],
                country: 'US',
                email: customerData["email"],
                phone: customerData["phone"]
            },
            shipping: {
                first_name: customerData["first_name"],
                last_name: customerData["last_name"],
                company: customerData["company"],
                address_1: customerData["address"],
                address_2: '',
                city: customerData["city"],
                state: customerData["state"],
                postcode: customerData["zip"],
                country: 'US',
            }
        }
        let resp = await new Promise((resolve, reject) => {
            this.wooCommerce.post('customers', data, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(data)
                }
            })
        })
        return resp
    }

    async postProduct() {
        let productData = this.getProduct()
        let categoryResponse = await new Promise((resolve, reject) => {
            this.wooCommerce.get(`products/categories?search=${productData.category}`, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(JSON.parse(data))
                }
            })
        })
        let category;
        if (categoryResponse.length > 0)
            category = await categoryResponse[0]

        if (categoryResponse.status === 0) {
            let categoryResponse = await new Promise((resolve, reject) => {
                this.wooCommerce.post(`products/categories`, {
                    name: productData.category,
                    image: {
                        src: productData.image
                    }
                }, (err, res, data) => {
                    if (err)
                        return reject(err)
                    else {
                        return resolve(JSON.parse(data))
                    }
                })
            })
            category = await categoryResponse
        }
        let productResponse = await new Promise((resolve, reject) => {
            this.wooCommerce.post(`products`, {
                name: productData["name"],
                regular_price: productData["price"],
                description: productData["description"],
                short_description: productData["description"],
                categories: [
                    {
                        id: category.id
                    }
                ],
                images: [
                    {
                        src: productData["image"],
                        position: generateRandomInt(0, 1)
                    }
                ]
            }, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(JSON.parse(data))
                }
            })
        })
        return productResponse
    }

    async getRandomProductFromShop(count) {
        let product = await new Promise((resolve, reject) => {
            this.wooCommerce.get(`products?per_page=1&page=${generateRandomInt(1, count)}`, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(JSON.parse(data))
                }
            })
        })
        return product[0]
    }

    async getRandomCustomerFromShop(count) {
        let customerCount = await new Promise((resolve, reject) => {
            this.wooCommerce.get('customers', (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(res)
                }
            })
        })
        let customer = await new Promise((resolve, reject) => {
            this.wooCommerce.get(`customers?per_page=1&page=${generateRandomInt(1,customerCount.headers['x-wp-total'])}`, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(JSON.parse(data))
                }
            })
        })
        return customer[0]
    }

    async getProductsList() {
        let productCount = await new Promise((resolve, reject) => {
            this.wooCommerce.get(`products?per_page=1`, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(res)
                }
            })
        })
        let arrayOfProducts = [];
        for (let i = 0; i < generateRandomInt(1, 5); i++) {
            arrayOfProducts.push(await this.getRandomProductFromShop(productCount.headers['x-wp-total']))
        }
        return arrayOfProducts
    }

    async postOrder() {

        let customer = await this.getRandomCustomerFromShop()
        let productsList = await this.getProductsList()
        let orderStatus = generateRandomInt(1, 14)
        let status = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded' , 'failed']
        let order = {
            customer_id: customer.id,
            line_items: productsList.map(p => ({
                product_id: p.id,
                quantity: generateRandomInt(1, 5)
            })),
            billing: customer.billing,
            shipping: customer.shipping,
            status: status[generateRandomInt(0,status.length)]
        }

        let orderResponse = await new Promise((resolve, reject) => {
            this.wooCommerce.post('orders', order, (err, res, data) => {
                if (err)
                    return reject(err)
                else {
                    return resolve(JSON.parse(data))
                }
            })
        })

        return orderResponse
    }
}
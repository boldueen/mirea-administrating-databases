const db = db.getSiblingDB('shop_db');

const collections = ['orders', 'products', 'clients', 'workers'];

const CRUD = {
    insertOneProduct: function (name, category, amount, price) {
        db.products.insertOne({
            name: name,
            category: category,
            amount: amount,
            price: price,
        });
    },

    deleteOneProduct: function (_id = null, name = null) {
        if (_id && name) {
            return 'specify only one param (_id OR name)';
        }

        if (_id) {
            return db.products.deleteOne({ _id: ObjectId(`${_id}`) });
        }

        if (name) {
            return db.products.deleteOne({ name: name });
        }
    },

    createOrder: function (
        clientEmail,
        products,
        status = 'CREATED',
        date = null
    ) {
        const client = db.clients.findOne({ email: clientEmail });
        if (!client) {
            return 'client does not exists';
        }

        if (!date) {
            date = new Date();
        }

        let total = 0.0;

        for (const product of products) {
            const productInDb = db.products.findOne({ name: product.name });
            if (!productInDb) {
                return `NO PRODUCT WITH NAME ${product.name}`;
            }
            total += productInDb.price * product.amount;
        }

        db.orders.insertOne({
            clientEmail: clientEmail,
            products: products,
            status: status,
            date: date,
            total: total,
        });
    },

    changeOrderStatus: function (orderIdAsStr, status) {
        db.orders.updateOne(
            { _id: ObjectId(orderIdAsStr) },
            { $set: { status: status } }
        );
    },

    createClient: function (email, fullname) {
        db.clients.insertOne({ email: email, fullname: fullname });
    },

    getProductsByCategory: function (categoryName) {
        return db.products.find({ category: categoryName });
    },

    findProductByName: function (productName) {
        return db.products.find({ name: productName });
    },

    getCategories: function () {
        return db.products.distinct('category');
    },

    getClientOrders: function (clientEmail) {
        return db.orders.find({ clientEmail: clientEmail });
    },

    getClientsByOrdersAmount: function (ordersAmount) {
        return db.orders.aggregate([
            { $match: { status: 'DONE' } },
            {
                $group: {
                    _id: '$clientEmail',
                    total: { $sum: '$total' },
                    ordersAmount: { $count: {} },
                },
            },
            {
                $match: { ordersAmount: { $gt: ordersAmount } },
            },
            {
                $sort: {
                    ordersAmount: -1,
                },
            },
        ]);
    },

    getTopPriceSales: function () {},

    getTopAmountSales: function () {},
};

const schemas = {
    products: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'type object schema',
                required: ['name', 'category', 'price'],
                properties: {
                    name: {
                        bsonType: 'string',
                        description: 'must be a string and is required',
                    },
                    price: {
                        bsonType: 'double',
                    },
                    category: {
                        bsonType: 'string',
                        description: 'must be a string',
                    },
                },
            },
        },
    },

    orders: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'type object schema',
                required: ['products', 'date', 'status', 'clientEmail'],
                properties: {
                    products: {
                        bsonType: 'array',
                        items: {
                            bsonType: 'object',
                            properties: {
                                name: {
                                    bsonType: 'string',
                                    description:
                                        'must be a string and is required',
                                },
                                amount: {
                                    bsonType: 'int',
                                    minimum: 0,
                                },
                            },
                        },
                    },
                    date: {
                        bsonType: 'date',
                    },
                    status: {
                        bsonType: 'string',
                    },
                    total: {
                        bsonType: 'double',
                    },
                    clientEmail: {
                        bsonType: 'string',
                    },
                },
            },
        },
    },

    clients: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'type object schema',
                required: ['email', 'fullname'],
                properties: {
                    email: {
                        bsonType: 'string',
                        description: 'must be a string and is required',
                    },
                    fullname: {
                        bsonType: 'string',
                        description: 'must be a string and is required',
                    },
                },
            },
        },
    },

    workers: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                title: 'type object schema',
                required: ['email', 'fullname', 'role'],
                properties: {
                    email: {
                        bsonType: 'string',
                        description: 'must be a string and is required',
                    },
                    fullname: {
                        bsonType: 'string',
                        description: 'must be a string and is required',
                    },
                    role: {
                        bsonType: 'string',
                    },
                },
            },
        },
    },
};

// function createDatabaseUsersAndRoles() {
//     db.createRole(
//         // Создание роли клиента
//         {
//             role: 'client',
//             privileges: [
//                 {
//                     actions: ['find'],
//                     resource: { db: 'shop_db', collection: 'products' },
//                 },
//                 {
//                     actions: ['find', 'insert'],
//                     resource: { db: 'shop_db', collection: 'orders' },
//                 },
//             ],
//             roles: ['products_viewer'],
//         }
//     );
//     db.createUser({
//         user: 'visiter',
//         pwd: '1234', // or cleartext password
//         roles: [{ role: 'products_viewer', db: 'shop_db' }],
//     });
// }

function resetCollections() {
    for (const collection of collections) {
        db[collection].drop();
    }
}

function initCollections() {
    for (const collection of collections) {
        db.createCollection(collection, schemas[collection]);
    }

    db.clients.createIndex(
        {
            email: 1,
        },
        {
            unique: true,
            sparse: true,
        }
    );
}

function initData() {
    const products = [
        { name: 'nail', category: 'stuff', amount: '55', price: 2.34 },
        {
            name: 'earphones',
            category: 'electronics',
            amount: '23',
            price: 43.12,
        },
        {
            name: 'computer',
            category: 'electronics',
            amount: '3',
            price: 150.12,
        },
        { name: 'apple', category: 'food', amount: '5', price: 4.01 },
        {
            name: 'nike air shoes',
            category: 'clothes',
            amount: '6',
            price: 100.12,
        },
    ];
    for (const product of products) {
        CRUD.insertOneProduct(
            product.name,
            product.category,
            product.amount,
            product.price
        );
    }

    const clients = [
        { email: 'comon@mail.ru', fullname: 'joe cocker' },
        { email: 'do-it@mail.ru', fullname: 'jocker popov' },
        { email: 'canon@test.ru', fullname: 'phoro Yuri' },
    ];
    for (const client of clients) {
        CRUD.createClient(client.email, client.fullname);
    }
}

function init() {
    resetCollections();
    initCollections();
    initData();
}

// init();

// CRUD.createOrder('comon@mail.ru', [
//     { name: 'apple', amount: 1 },
//     { name: 'earphones', amount: 55 },
// ]);

// CRUD.changeOrderStatus('642864debd6723e5d61f7c23', 'DONE');

// CRUD.getProductsByCategory('electronics');

// CRUD.getCategories();

// CRUD.findProductByName('apple');

// CRUD.getClientOrders('do-it@mail.ru');

// CRUD.getClientsByOrdersAmount(2);

// createDatabaseUsersAndRoles();

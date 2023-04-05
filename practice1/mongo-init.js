const db = db.getSiblingDB('shop_db');

const collections = ['orders', 'products', 'clients', 'workers'];

const CRUD = {
	// добавить продукт
	insertOneProduct: function (name, category, amount, price) {
		db.products.insertOne({
			name: name,
			category: category,
			amount: amount,
			price: price,
		});
	},

	// удалить продукт
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

	// созать заказ
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

	// поменять статус заказа
	changeOrderStatus: function (orderIdAsStr, status) {
		db.orders.updateOne(
			{ _id: ObjectId(orderIdAsStr) },
			{ $set: { status: status } }
		);
	},

	// создать клиента
	createClient: function (email, fullname) {
		db.clients.insertOne({ email: email, fullname: fullname });
	},

	// получить все продукты из категории
	getProductsByCategory: function (categoryName) {
		return db.products.find({ category: categoryName });
	},

	// найти продукт по названию
	findProductByName: function (productName) {
		return db.products.find({ name: productName });
	},

	// получить все категории
	getCategories: function () {
		return db.products.distinct('category');
	},

	// получить все заказы одного клиента
	getClientOrders: function (clientEmail) {
		return db.orders.find({ clientEmail: clientEmail });
	},

	// получить всех клиентов, количество завершенных заказов у которых >= ordersAmount
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

	// получить топ самых дорогих продаж
	getTopPriceSales: function (limit) {
		return db.orders.aggregate([
			{ $match: { status: 'DONE' } },
			{
				$sort: {
					total: -1,
				},
			},
			{
				$limit: limit,
			},
		]);
	},

	// получить топ крупных (по количеству) продаж
	getTopAmountSales: function (limit) {
		return db.orders.aggregate([
			{ $match: { status: 'DONE' } },
			{
				$sort: {
					total: -1,
				},
			},
			{
				$limit: limit,
			},
		]);
	},
};

// Валидаторы
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
									description: 'must be a string and is required',
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

function initUsersAndRoles() {
	// Создание ролей
	db.createRole({
		role: 'visiter',
		privileges: [
			{
				actions: ['find'],
				resource: { db: 'shop_db', collection: 'products' },
			},
		],
		roles: [],
	});

	db.createRole({
		role: 'client',
		privileges: [
			{
				actions: ['find'],
				resource: { db: 'shop_db', collection: 'products' },
			},
			{
				actions: ['find', 'insert'],
				resource: { db: 'shop_db', collection: 'orders' },
			},
		],
		roles: ['visiter'],
	});

	db.createRole({
		role: 'admin',
		privileges: [
			{
				actions: ['insert', 'update', 'remove'],
				resource: { db: 'shop_db', collection: '' },
			},
		],
		roles: ['visiter'],
	});

	db.createRole({
		role: 'manager',
		privileges: [
			{
				actions: ['insert', 'update', 'remove'],
				resource: { db: 'shop_db', collection: 'products' },
			},
			{
				actions: ['update'],
				resource: { db: 'shop_db', collection: 'orders' },
			},
		],
		roles: ['visiter'],
	});

	db.createRole({
		role: 'client',
		privileges: [
			{
				actions: ['find', 'insert'],
				resource: { db: 'shop_db', collection: 'orders' },
			},
		],
		roles: ['visiter'],
	});

	// Создание пользователей
	db.createUser({
		user: 'cool_admin',
		pwd: 'changeme',
		roles: [
			{
				role: 'admin',
				db: 'shop_db',
			},
		],
	});

	db.createUser({
		user: 'manager',
		pwd: 'changeme',
		roles: [
			{
				role: 'manager',
				db: 'shop',
			},
		],
	});

	db.createUser({
		user: 'client',
		pwd: 'changeme',
		roles: [
			{
				role: 'client',
				db: 'shop',
			},
		],
	});

	db.createUser({
		user: 'viewer',
		pwd: 'changeme',
		roles: [
			{
				role: 'products_viewer',
				db: 'shop',
			},
		],
	});
}

function testValidation() {
	// Tests

	// test 1
	try {
		db.products.insertOne({
			name: 'test',
			price: '123.12', // цена должна быть double
			category: 'text',
		});
	} catch (error) {
		if (error.errInfo == null) {
			return Error('Тест 1 не пройден');
		}
	}

	// test 2
	try {
		db.products.insertOne({
			name: 'test',
			price: 123.23,
			category: 123123, // категория должна быть string
		});
	} catch (error) {
		if (error.errInfo == null) {
			return Error('Тест 2 не пройден');
		}
	}

	// test 3
	try {
		db.orders.insertOne({
			items: 'test', // items должны быть array
			status: 'PROCESS',
			total: 123.12,
			clientEmail: 'some_mail@mail.ru',
			date: new Date(),
		});
	} catch (error) {
		if (error.errInfo == null) {
			return Error('Тест 3 не пройден');
		}
	}
}

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

init();

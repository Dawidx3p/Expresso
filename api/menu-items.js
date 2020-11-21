const express = require('express');
const menuItemsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
	sql = 'select * from MenuItem where MenuItem.id = $menuItemId';
	values = {$menuItemId: menuItemId};
	db.get(sql, values, (error, menuItem) => {
		if(error){
			next(error);
		}else if (menuItem){
			req.menuItem = menuItem;
			next();
		}else {
			res.sendStatus(404);
		}
	});
});

menuItemsRouter.get('/', (req, res, next) => {
	db.all(`select * from MenuItem where MenuItem.menu_id = ${req.menu.id}`, (error, menuItems) => {
		if(error){
			next(error);
		}else{
			res.status(200).json({menuItems: menuItems});
		}
	});
});

menuItemsRouter.post('/', (req, res, next) => {
	const name = req.body.menuItem.name,
	description = req.body.menuItem.description,
	inventory = req.body.menuItem.inventory,
	price = req.body.menuItem.price;
	if(!name || !inventory || !price){
		return res.sendStatus(400);
	}
	const sql = 'insert into MenuItem (name, description, inventory, price, menu_id) values ( $name, $description, $inventory, $price, $menuId )';
	const values = {
		$name: name,
		$description: description, 
		$inventory: inventory, 
		$price: price,
		$menuId: req.menu.id
		};
	db.run(sql, values, function(error) {
		if(error){
			next(error);
		}else{
			db.get(`select * from MenuItem where MenuItem.id = ${this.lastID}`, (error, menuItem) => {
				res.status(201).json({menuItem: menuItem});
			});
		}
	});
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
	const name = req.body.menuItem.name,
	description = req.body.menuItem.description,
	inventory = req.body.menuItem.inventory,
	price = req.body.menuItem.price;
	if(!name || !inventory || !price){
		return res.sendStatus(400);
	}
	const sql = 'update MenuItem set name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId where MenuItem.id = $menuItemId';
	const values = {
		$name: name,
		$description: description, 
		$inventory: inventory, 
		$price: price,
		$menuId: req.menu.id,
		$menuItemId: req.params.menuItemId
		};
	db.run(sql, values, (error) => {
		if(error){
			next(error);
		}else{
			db.get(`select * from MenuItem where MenuItem.id = ${req.params.menuItemId}`, (error, menuItem) => {
				res.status(200).json({menuItem: menuItem});
			});
		}
	});
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
	sql = 'delete from MenuItem where MenuItem.id = $menuItemId';
	values = {$menuItemId: req.params.menuItemId };
	db.run(sql, values, (error) => {
		if(error){
			next(error);
		}else {
			res.sendStatus(204);
		}
	})
});

module.exports = menuItemsRouter;
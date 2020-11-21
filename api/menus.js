const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menu-items.js');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
	const sql = 'select * from Menu where Menu.id = $menuId';
	const values = {$menuId: menuId};
	db.get(sql, values, (error, menu) => {
		if(error){
			next(error);
		}else if(menu){
			req.menu = menu;
			next();
		}else {
			res.sendStatus(404);
		}
	});
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
	db.all('select * from Menu', (error, menus) => {
		if(error){
			next(error);
		}else {
		res.status(200).json({menus: menus});
		}
	});
});

menusRouter.get('/:menuId', (req, res, next) => {
	res.status(200).json({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
	const title = req.body.menu.title
	if(!title){
		return res.sendStatus(400);
	}
	const sql = 'INSERT INTO Menu( title ) values ( $title )'
	const values = {$title: title};
	db.run(sql, values, function(error) {
		if(error){
			next(error);
		}else {
			db.get(`select * from Menu where Menu.id = ${this.lastID}`, (error, menu) => {
				res.status(201).json({menu: menu})
			});
		}
	});
});

menusRouter.put('/:menuId', (req, res, next) => {
	const title = req.body.menu.title
	if(!title){
		return res.sendStatus(400);
	}
	const sql = 'update Menu SET title = $title where Menu.id = $menuId';
	const values = {
		$title: title,
		$menuId: req.params.menuId };
	db.run(sql, values, (error) => {
		if(error){
			next(error);
		}else {
			db.get(`select * from Menu where Menu.id = ${req.params.menuId}`, (error, menu) => {
				res.status(200).json({menu: menu})
			});
		}
	});
});

menusRouter.delete('/:menuId', (req, res, next) => {
		db.all(`select * from MenuItem where MenuItem.menu_id = ${req.params.menuId}`, (error, menuItem) => {
			if(error){
				next(error);
			}else if(menuItem.length > 0){
				res.sendStatus(400);
			}else{
				const sql = 'delete from Menu where Menu.id = $menuId';
				const values = {$menuId: req.params.menuId};
				db.run(sql, values, (error) => {
					if(error){
						next(error);
					}else {
						res.sendStatus(204);
					}
				});
			}
		});
		
});

module.exports = menusRouter;
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');

db.serialize( () => {
	db.run('drop table if exists `Employee`');
	db.run('create table if not exists Employee( ' + 
	'id INTEGER NOT NULL PRIMARY KEY, ' +
	'name TEXT NOT NULL, ' + 
	'position TEXT NOT NULL, ' +
	'wage INTEGER NOT NULL, ' +
	'is_current_employee INTEGER DEFAULT 1)');
	
	db.run('drop table if exists Timesheet');
	db.run('create table if not exists Timesheet( ' + 
	'id INTEGER NOT NULL PRIMARY KEY, ' +
	'hours INTEGER NOT NULL, ' +
	'rate INTEGER NOT NULL, ' +
	'date INTEGER NOT NULL, ' +
	'employee_id INTEGER NOT NULL, ' + 
	'FOREIGN KEY(employee_id) REFERENCES Employee(id) )');
	
	db.run('drop table if exists Menu');
	db.run('create table if not exists Menu( ' + 
	'id INTEGER NOT NULL PRIMARY KEY, ' +
	'title TEXT NOT NULL )'); 
	
	db.run('drop table if exists MenuItem');
	db.run('create table if not exists MenuItem( ' + 
	'id INTEGER NOT NULL PRIMARY KEY, ' +
	'name TEXT NOT NULL, ' + 
	'description TEXT, ' +
	'inventory INTEGER NOT NULL, ' +
	'price INTEGER NOT NULL, ' +
	'menu_id INTEGER NOT NULL, ' +
	'FOREIGN KEY (menu_id) REFERENCES Menu(id) )' );
});
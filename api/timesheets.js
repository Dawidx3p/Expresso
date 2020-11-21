const express = require('express');
const timesheetsRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
	db.get(`select * from Timesheet where Timesheet.id = ${req.params.timesheetId}`, (error, timesheet) => {
		if(error){
			next(error);
		}else if(timesheet) {
			req.timesheet = timesheet;
			next();
		}else {
			res.sendStatus(404);
		}
	});
});

timesheetsRouter.get('/', (req, res, next) => {
	const sql = 'select * from Timesheet where employee_id = $employeeId';
	const values = {$employeeId: req.employee.id};
	db.all(sql, values, (error, timesheets) => {
		if(error){
			next(error);
		}else {
			res.status(200).json({timesheets: timesheets});
		}
	});
});

timesheetsRouter.post('/', (req, res, next) => {
	const hours = req.body.timesheet.hours,
	rate = req.body.timesheet.rate,
	date = req.body.timesheet.date;
	if(!hours || !rate || !date){
		return res.sendStatus(400);
	}
	const sql = 'insert into Timesheet ( hours, rate, date, employee_id ) values ($hours, $rate, $date, $employeeId)';
	const values = {
		$hours: hours,
		$rate: rate,
		$date: date,
		$employeeId: req.employee.id
	};
	db.run(sql, values, function(error) {
		if(error){
			next(error);
		}else {
		db.get(`select * from Timesheet where Timesheet.id = ${this.lastID}`, (error, timesheet) => {
			res.status(201).json({timesheet: timesheet});
		});
		}
	});
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
	const hours = req.body.timesheet.hours,
	rate = req.body.timesheet.rate,
	date = req.body.timesheet.date;
	if(!hours || !rate || !date){
		return res.sendStatus(400);
	}
	const sql = 'update Timesheet set hours = $hours, rate = $rate, date = $date, employee_id = $employeeId where Timesheet.id = $timesheetId';
	const values = {
		$hours: hours,
		$rate: rate,
		$date: date,
		$employeeId: req.employee.id,
		$timesheetId: req.params.timesheetId
	};
	db.run(sql, values, (error) => {
		if(error){
			next(error);
		}else {
			db.get(`select * from Timesheet where Timesheet.id = ${req.params.timesheetId}`, (error, timesheet) => {
				res.status(200).json({timesheet: timesheet});
			});
		}
	});
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
	sql = 'delete from Timesheet where Timesheet.id = $timesheetId';
	values = {$timesheetId: req.params.timesheetId };
	db.run(sql, values, (error) => {
		if(error){
			next(error);
		}else {
			res.sendStatus(204);
		}
	})
});

module.exports = timesheetsRouter;
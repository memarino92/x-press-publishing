const express = require('express');
const sqlite3 = require('sqlite3');
const issuesRouter = require('./issues');

const seriesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, (err, series) => {
        if (err) {
            next(err);
        } else {
            if (series) {
                req.series = series;
                next();
            } else {
                res.status(404).send();
            }
        }
    });
});

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.send({series: rows});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.send({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    let series = req.body.series;
    if (series.name &&
        series.description) {
            const { name, description,  } = series;
            db.run(`INSERT INTO Series (
                name,
                description
                )
                VALUES (
                    '${name}',
                    '${description}'
                    )`, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (err, newSeries) => {
                            if (err) {
                                next(err);
                            } else {
                                res.status(201).send({series: newSeries});
                            }
                        })
                    }
                })
        } else {
            res.sendStatus(400);
        }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    let series = req.body.series;
    if (series.name &&
        series.description) {
            const { name, description,  } = series;
            db.run(`UPDATE Series SET
            name = '${name}',
            description = '${description}'
            WHERE id = ${req.params.seriesId}`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (err, updatedSeries) => {
                        if (err) {
                            next(err);
                        } else {
                            res.send({series: updatedSeries});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, issue) => {
        if (issue) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Series WHERE id = ${req.params.seriesId}`, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            })
        }
    })
})

seriesRouter.use('/:seriesId/issues', issuesRouter);

module.exports = seriesRouter;
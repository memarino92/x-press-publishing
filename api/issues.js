const express = require('express');
const sqlite3 = require('sqlite3');

const issuesRouter = express.Router({mergeParams: true});
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) => {
    db.get(`SELECT * FROM Issue WHERE id = ${issueId}`, (err, issue) => {
        if (err) {
            next(err);
        } else {
            if (issue) {
                req.issue = issue;
                next();
            } else {
                res.status(404).send();
            }
        }
    });
});

issuesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.send({issues: rows});
        }
    });
});

issuesRouter.post('/', (req, res, next) => {
    let issue = req.body.issue;
    if (issue.name &&
        issue.issueNumber &&
        issue.publicationDate &&
        issue.artistId) {
            const { name, issueNumber, publicationDate, artistId } = issue;
            db.run(`INSERT INTO Issue (
                name,
                issue_number,
                publication_date,
                artist_id,
                series_id
                )
                VALUES (
                    '${name}',
                    ${issueNumber},
                    '${publicationDate}',
                    ${artistId},
                    ${req.params.seriesId}
                    )`, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, (err, newIssue) => {
                            if (err) {
                                next(err);
                            } else {
                                res.status(201).send({issue: newIssue});
                            }
                        })
                    }
                })
        } else {
            res.sendStatus(400);
        }
});

issuesRouter.put('/:issueId', (req, res, next) => {
    let issue = req.body.issue;
    if (issue.name &&
        issue.issueNumber &&
        issue.publicationDate &&
        issue.artistId) {
            const { name, issueNumber, publicationDate, artistId } = issue;
            db.run(`UPDATE Issue SET
            name = '${name}',
            issue_number = ${issueNumber},
            publication_date = '${publicationDate}',
            artist_id = ${artistId},
            series_id = ${req.params.seriesId}
            WHERE id = ${req.params.issueId}`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`, (err, updatedIssue) => {
                        if (err) {
                            next(err);
                        } else {
                            res.send({issue: updatedIssue});
                        }
                    });
                }
            });
        } else {
            res.status(400).send();
        }
});

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = issuesRouter;
const express = require('express');
const sqlite3 = require('sqlite3');

const artistsRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.param('artistId', (req, res, next, artistId) => {
    db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (err, artist) => {
        if (err) {
            next(err);
        } else {
            if (artist) {
                req.artist = artist;
                next();
            } else {
                res.status(404).send();
            }
        }
    });
});

artistsRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.send({artists: rows});
        }
    });
});

artistsRouter.get('/:artistId', (req, res, next) => {
    res.send({artist: req.artist});
});

artistsRouter.post('/', (req, res, next) => {
    let artist = req.body.artist;
    if (artist.name &&
        artist.dateOfBirth &&
        artist.biography) {
            if (!artist.isCurrentlyEmployed) {
                artist.isCurrentlyEmployed = 1;
            }
            const { name, dateOfBirth, biography, isCurrentlyEmployed } = artist;
            db.run(`INSERT INTO Artist (
                name,
                date_of_birth,
                biography,
                is_currently_employed)
                VALUES (
                    '${name}',
                    '${dateOfBirth}',
                    '${biography}',
                    ${isCurrentlyEmployed}
                )`, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (err, newArtist) => {
                            if (err) {
                                next(err);
                            } else {
                                res.status(201).send({artist: newArtist});
                            }
                        })
                    }
                })
        } else {
            res.sendStatus(400);
        }
});

artistsRouter.put('/:artistId', (req, res, next) => {
    let artist = req.body.artist;
    if (artist.name &&
        artist.dateOfBirth &&
        artist.biography) {
            if (!artist.isCurrentlyEmployed) {
                artist.isCurrentlyEmployed = 1;
            }
            const {name, dateOfBirth, biography, isCurrentlyEmployed } = artist;
            db.run(`UPDATE Artist SET
            name = '${name}',
            date_of_birth = '${dateOfBirth}',
            biography = '${biography}',
            is_currently_employed = ${isCurrentlyEmployed}
            WHERE id = ${req.params.artistId}`, function(err) {
                if (err) {
                    next(err);
                } else {
                    db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, updatedArtist) => {
                        if (err) {
                            next(err);
                        } else {
                            res.send({artist: updatedArtist});
                        }
                    });
                }
            });
    } else {
        res.status(400).send();
    }
});

artistsRouter.delete('/:artistId', (req, res, next) => {
    db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = ${req.params.artistId}`, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, deletedArtist) => {
                if (err) {
                    next(err);
                } else {
                    res.send({artist: deletedArtist})
                }
            });
        }
    });
});


module.exports = artistsRouter;
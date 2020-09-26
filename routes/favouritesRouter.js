const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Dishes = require('../models/dishes');
const Favourites = require('../models/favorite');

const favRouter = express.Router();

const cors = require('./cors');
var authenticate = require('../authenticate');

favRouter.use(bodyParser.json());


favRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favourites.find({})
            .populate('author')
            .populate('favDish')
            .then((favs) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favs);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        console.log('reached')
        Dishes.findById(req.body[0]._id)
            .then((dish) => {
                // if(favs.author.)
                console.log(req.user.id, 'ok');
                let favobject = {
                    favDish: dish._id,
                    author: req.user.id
                }
                console.log(favobject);
                Favourites.find(favobject)
                    .then((favs) => {
                        console.log(favs, 'finded')
                        if (favs.length <= 0) {
                            Favourites.create(favobject)
                                .then((favs) => {
                                    console.log('Dish Created ', favs);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favs);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }
                        else {
                            res.statusCode = 403;
                            res.end('Already favourited');
                        }
                    })

            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
        Favourites.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });



favRouter.route('/:favId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favourites.findById(req.params.dishId)
            .populate('comments.author')
            .then((dish) => {
                if (dish != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish.comments);
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favourites.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    req.body.author = req.user._id;
                    dish.comments.push(req.body);
                    dish.save()
                        .then((dish) => {
                            Dishes.findById(dish._id)
                                .populate('comments.author')
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(dish);
                                })
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dishes/'
            + req.params.dishId + '/comments');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.varifyAdmin, (req, res, next) => {
        Favourites.findById(req.params.dishId)
            .then((dish) => {
                if (dish != null) {
                    for (var i = (dish.comments.length - 1); i >= 0; i--) {
                        dish.comments.id(dish.comments[i]._id).remove();
                    }
                    dish.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dish);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favRouter;
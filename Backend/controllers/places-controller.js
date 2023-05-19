const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');


const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
        console.log(place);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.',
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            'Could not find a place for the provided id.',
            404
        );
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, please try again later',
            500
        );
        return next(error);
    }

    // if (!places || places.length === 0) {
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404)
        );
    }

    res.json({
        places: userWithPlaces.places.map(place =>
            place.toObject({ getters: true })
        )
    });
};


const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const { title, description, address, creator } = req.body;

    console.log(creator);

    const createdPlace = new Place({
        title,
        description,
        image: req.file.path,
        address,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);
    user.places.push(createdPlace);

    try {
        createdPlace.save();
        user.save();
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }
    // DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place.',
            500
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place.',
            500
        );
        return next(error);
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find place for this id.', 404);
        return next(error);
    }

    try {
        await place.remove();
        await place.creator.places.pull(place);
        await place.creator.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
        );
        return next(error);
    }

    res.status(200).json({ message: 'Deleted place.' });
};

exports.deletePlace = deletePlace;
exports.updatePlace = updatePlace;
exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
const Driver = require('../models/driver');

module.exports = {
    greeting(req, res) {
        res.send({ hi: 'there' });
    },

    index(req, res, next) {
        const {lng, lat} = req.query;
        var point = {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          };

        Driver.aggregate([{
            $geoNear: {
                near: point,
                distanceField: 'dist',
                spherical: true, 
                maxDistance: 200000
            }
        }])
        .then(drivers => {
            res.send(drivers);
        })
        .catch(next);
    },

    create(req, res, next) {
        const driverProps = req.body;

        Driver.create(driverProps)
            .then(driver => res.status(201).send(driver))
            .catch(next);   
    },

    edit(req, res, next) {
        const driverId = req.params.id;
        const driverProps = req.body;

        Driver.findOneAndUpdate({ _id: driverId}, driverProps)
            .then(() => Driver.findById(driverId))
            .then(driver => res.send(driver))
            .catch(next);
    },

    delete(req, res, next) {
        const driverId = req.params.id;

        Driver.findOneAndRemove({_id: driverId})
            .then(driver => res.status(204).send(driver))
            .catch(next);
    }
};
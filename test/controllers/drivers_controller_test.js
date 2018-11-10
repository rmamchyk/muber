const assert = require('assert');
const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Driver = mongoose.model('driver');

describe('Drivers controller', () => {

    it('POST to /api/drivers creates a new driver', done => {
        const driverData = {email: 'test@test.com'};

        Driver.countDocuments().then(count => {
            request(app)
                .post('/api/drivers')
                .send(driverData)
                .end((err, res) => {
                    assert(res.body.email === driverData.email);

                    Driver.countDocuments().then(newCount => {
                        assert(newCount === count + 1);
                        done();
                    });
                });
        });
    });

    it('PUT to /api/drivers/:id updates an existing driver', done => {
        const driver = new Driver({email: 't@t.com', driving: false});
        driver.save()
            .then(() => {
                request(app)
                    .put(`/api/drivers/${driver._id}`)
                    .send({driving: true})
                    .end((err, res) => {
                        assert(res.body.driving === true);

                        Driver.findById(driver._id)
                            .then(dr => {
                                assert(dr.email === driver.email);
                                assert(dr.driving === true);
                                done();
                            });
                    })
            })
    });

    it('DELETE to /api/drivers/:id deletes an existing driver', done => {
        const driver = new Driver({email: 'test@test.com'});

        driver.save().then(() => {
            request(app)
                .delete(`/api/drivers/${driver._id}`)
                .end(() => {
                    Driver.findById(driver._id)
                        .then(dr => {
                            assert(dr === null);
                            done();
                        });
                });
        });
    });

    it('GET to /api/drivers finds drivers in a location', done => {
        const seattleDriver = new Driver({
            email: 'seattle@test.com',
            geometry: { type: 'Point', coordinates: [-122.4759902, 47.6147628]}
        });
        const miamiDriver = new Driver({
            email: 'miami@test.com',
            geometry: { type: 'Point', coordinates: [-80.253, 25.791]}
        });

        Promise.all([seattleDriver.save(), miamiDriver.save()])
            .then(() => {
                request(app)
                    .get('/api/drivers?lng=-80&lat=25')
                    .end((err, res) => {
                        assert(res.body.length === 1);
                        assert(res.body[0].email === 'miami@test.com');
                        assert(res.body[0]._id.toString() === miamiDriver._id.toString());
                        done();
                    });
            });
    });

});
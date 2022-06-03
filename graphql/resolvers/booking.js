'use strict';
const Booking = require('../../models/booking');
const Event = require('../../models/event');
const { transformEvent, transformBooking } = require('./resolverHelpers');

module.exports = {
  bookings: async (args, req) => {
    console.log('Req in bookings ', req);
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const bookings = await Booking.find({ 'user': req.userId });
    return bookings.map((booking) => (transformBooking(booking)));
  },
  bookEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const event = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: req.userId,
      event
    });
    await booking.save();
    return transformBooking(booking);
  },
  cancelBooking: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const booking = await Booking.findById(args.bookingId).populate('event');
    const event = transformEvent(booking._doc.event);
    await Booking.deleteOne({ _id: args.bookingId });
    return event;
  }
};


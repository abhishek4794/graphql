'use strict';

const Event = require('../../models/event');
const User = require('../../models/user');
const { dateToString } = require('../../helper/date');


const transformEvent = (event) => ({
  ...event._doc,
  _id: event.id,
  date: dateToString(event._doc.date),
  // eslint-disable-next-line no-use-before-define
  creator: user.bind(this, event._doc.creator) });

const events = (eventIds) => Event.find({ _id: { $in: eventIds } })
  .then((event) => {
    const eventDataToReturn = [];
    event.map((iter) => {
      eventDataToReturn.push(transformEvent(iter));
    });
    return eventDataToReturn;
  })
  .catch((err) => {
    throw err;
  });

const user = (userId) => User.findById(userId)
  .then((user) => ({ ...user._doc,
    _id: user.id,
    // eslint-disable-next-line no-use-before-define
    createdEvents: events.bind(this, user._doc.createdEvents)
  }))
  .catch((err) => {
    throw err;
  });


const singleEvent = async (eventId) => {
  const event = await Event.findById(eventId);
  return transformEvent(event);
};


const transformBooking = (booking) => ({
  ...booking._doc,
  _id: booking.id,
  user: user.bind(this, booking._doc.user),
  event: singleEvent.bind(this, booking._doc.event),
  createdAt: dateToString(booking._doc.createdAt),
  updatedAt: dateToString(booking._doc.updatedAt),
});

module.exports = {
  transformEvent, transformBooking
};

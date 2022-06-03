'use strict';
const Event = require('../../models/event');
const { dateToString } = require('../../helper/date');
const User = require('../../models/user');
const { transformEvent } = require('./resolverHelpers');

module.exports = {
  events: () => Event.find()
    .then((events) =>
      events.map((event) => {
        console.log('Event', event);
        return transformEvent(event);
      })),
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('Unauthenticated!');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: dateToString(args.eventInput.date),
      creator: req.userId
    });
    let createdEvent = {};
    const result = await event.save();
    console.log(`Mongo DB Document save successful ${result}`);
    createdEvent = transformEvent(result);
    const creator = await User.findById(req.userId);

    if (!creator) {
      throw new Error('User not found.');
    }
    creator.createdEvents.push(event);
    await creator.save();

    return createdEvent;
    // events.push(event);
    // return event;
  },
};

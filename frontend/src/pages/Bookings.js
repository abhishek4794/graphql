import React, { Component } from 'react';

import Spinner from '../components/Spinner/Spinner';
import BookingList from '../components/BookingList/BookingList';
import AuthContext from '../context/auth-context';

class Bookings extends Component {
  state = {
    isLoading: false,
    bookings: []
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
  }

  cancelBooking(bookingId) {
  console.log('this. context',this.context);
  const token = this.context.token;
  let requestBody = {
          query: `
          mutation {
              cancelBooking(bookingId: "${bookingId}") {
                _id,
                title
                description
              }
          }`
      };

      fetch('http://localhost:4000/graphql',{
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          }
      }).then(res =>{
          if(res.status !== 200 && res.status !==201){
              throw new Error('Failed')
          }
          return res.json();
      }).then(resData => {
          // this.fetchEvents();
          console.log('ResData: ', resData)
          this.fetchBookings();
      })
      .catch(err => {
          console.log(err)
      })
  }
  fetchBookings = () => {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
          query {
            bookings {
              _id
             createdAt
             event {
               _id
               title
               date
             }
            }
          }
        `
    };

    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.context.token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }
        return res.json();
      })
      .then(resData => {
        const bookings = resData.data.bookings;
        this.setState({ bookings: bookings, isLoading: false });
      })
      .catch(err => {
        console.log(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <BookingList bookings={this.state.bookings} onDelete={this.cancelBooking.bind(this)}/>
        )}
      </React.Fragment>
    );
  }
}

export default Bookings;
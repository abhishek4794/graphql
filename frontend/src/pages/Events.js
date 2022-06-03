import React from 'react';
import './events.css'
import Modal from '../components/Modal/Modal'
import Backdrop from '../components/Backdrop/Backdrop'
import AuthContext from '../context/auth-context';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
export class Events extends React.Component {

  state = {
    creating: false,
    loading: false,
    events: [],
    selectedEvent: null
  };

  static contextType = AuthContext;

  constructor(props){
    super(props);

    this.titleElRef = React.createRef();
    this.priceElRef = React.createRef();
    this.dateElRef = React.createRef();
    this.descriptionElRef = React.createRef();
  }

  componentDidMount(){
    this.fetchEvents();
  }

  startCreateEventHandler = () =>{
    this.setState({creating: true})
  }


  modalConfirmHandler = () => {
    this.setState({ creating: false });
    const title = this.titleElRef.current.value;
    const price = +this.priceElRef.current.value;
    const date = this.dateElRef.current.value;
    const description = this.descriptionElRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const token = this.context.token;
    let requestBody = {
        query: `
        mutation {
            createEvent(eventInput: {title:"${title}",description:"${description}",date:"${date}",price:${price}})  {
                creator {
                  email
                }
                price
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
        this.fetchEvents();
    })
    .catch(err => {
        console.log(err)
    })
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  bookEventHandler = () => {
    console.log('')
    if(!this.context.token){
      this.setState({selectedEvent: null});
      return;
    }
    console.log('Inside bookEventHandler : ',this.state.selectedEvent)
    console.log('Context ', this.context)
    const eventId = this.state.selectedEvent._id;
    const token = this.context.token;
    let requestBody = {
        query: `
        mutation {
            bookEvent(eventId: "${eventId}") {
              _id,
              createdAt
              updatedAt
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
        this.setState({selectedEvent: null})
    })
    .catch(err => {
        console.log(err)
    })
  }

  fetchEvents() {
    this.setState({loading: true})
    let requestBody = {
        query: `
        query {
          events {
            _id
            title
            date
            description
            price
            creator {
              _id
              email
            }
          }
        }`
    };

    fetch('http://localhost:4000/graphql',{
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res =>{
        if(res.status !== 200 && res.status !==201){
            throw new Error('Failed')
        }
        return res.json();
    }).then(resData => {
        console.log(resData)
        const events = resData.data.events;
        this.setState({events, loading:false})
    })
    .catch(err => {
        console.log(err)
        this.setState({loading: false})
    })
  }

  showDetailHandler = eventId => {
    console.log('Show details handler :',eventId)
    this.setState(prevState => {
      const selectedEvent = prevState.events.find(e => e._id === eventId);
      console.log('selectedEvent :',selectedEvent);
      return {selectedEvent: selectedEvent}
    })
  }

  render() {
    return (
      <>
      {this.state.creating && <> <Backdrop />
        <Modal title="Add Event" 
        canCancel canConfirm
        onCancel={this.modalCancelHandler}
        onConfirm={this.modalConfirmHandler}
        confirmText="Confirm"
        >
           <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" ref={this.priceElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateElRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="4"
                  ref={this.descriptionElRef}
                />
              </div>
            </form>
        </Modal></>}
         {this.state.selectedEvent && 
          <Modal 
                title={this.state.selectedEvent.title}
                canCancel 
                canConfirm
                confirmText={this.context.token ? "Book" : "Confirm"}
                onCancel={this.modalCancelHandler}
                onConfirm={this.bookEventHandler} >
                  <div>
                    <h1>{this.state.selectedEvent.title}</h1>
                    <h2>
                      ${this.state.selectedEvent.price} - {new Date(this.state.selectedEvent.date).toLocaleDateString()}
                    </h2>
                  </div>
          </Modal>}
        {this.context.token && <div className="events-control">
            <p>Share your own Events!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>
              Create Event
            </button>
          </div>}
          {this.state.loading ? 
              <Spinner /> : 
              <EventList 
                events={this.state.events} 
                authUserId={this.context.userId}
                onViewDetail={this.showDetailHandler} />}
        </>
    )
  }
}
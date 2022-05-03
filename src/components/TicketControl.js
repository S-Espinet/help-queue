import { connect } from 'react-redux';
import React from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import TicketDetail from './TicketDetail';
import EditTicketForm from './EditTicketForm';
import PropTypes from 'prop-types';
import * as a from './../actions';
import { withFirestore, isLoaded } from 'react-redux-firebase';

class TicketControl extends React.Component {

  constructor(props) {
    super(props);
console.log(props);
    this.state = {
      selectedTicket: null,
      editing: false
    };
  }

  componentDidMount() {
    this.waitTimeUpdateTimer = setInterval(() =>
      this.updateTicketElapsedWaitTime(),
    60000
    );
  }

  componentWillUnmount(){
    clearInterval(this.waitTimeUpdateTimer);
  }

  // updateTicketElapsedWaitTime = () => {
  //   const { dispatch } = this.props;
  //   Object.values(this.props.mainTicketList).forEach(ticket => {
  //     const newFormattedWaitTime = ticket.timeOpen.fromNow(true);
  //     const action = a.updateTime(ticket.id, newFormattedWaitTime);
  //     dispatch(action);
  //   });
  // }

  handleClick = () => {
    if (this.state.selectedTicket != null) {
      this.setState({
        selectedTicket: null,
        editing: false
      });
    } else {
      const { dispatch } = this.props;
      const action = a.toggleForm();
      dispatch(action);
    }
  }


  handleAddingNewTicketToList = () => {
    const { dispatch } = this.props;
    const action = a.toggleForm();
    dispatch(action);
  }

  handleChangingSelectedTicket = (id) => {
    this.props.firestore.get({collection: 'tickets', doc: id}).then((ticket) => {
      const firestoreTicket = {
        names: ticket.get("names"),
        location: ticket.get("location"),
        issue: ticket.get("issue"),
        id: ticket.id
      }
      this.setState({selectedTicket: firestoreTicket });
    });
  }

  handleDeletingTicket = (id) => {
    this.props.firestore.delete({collection: 'tickets', doc: id});
    this.setState({selectedTicket: null});
  }

  handleEditClick = () => {
    console.log("handleEditClick reached!");
    this.setState({editing: true});
  }


  handleEditingTicketInList = () => {
    this.setState({
      editing: false,
      selectedTicket: null
    });
  }

  render(){
    const auth = this.props.firebase.auth();
    if (!isLoaded(auth)) {
      return (
        <React.Fragment>
          <h1 className="text-center">Loading...</h1>
        </React.Fragment>
      )
    }
    if ((isLoaded(auth)) && (auth.currentUser == null)) {
      return (
      <React.Fragment>
        <h1 className="text-center">You Must Be Signed In To Access The Queue!</h1>
      </React.Fragment>
      )}
    if ((isLoaded(auth)) && (auth.currentUser != null)) {
      let currentlyVisibleState = null;
      let buttonText = null;
      if (this.state.editing) {
        currentlyVisibleState = <EditTicketForm ticket = {this.state.selectedTicket} onEditTicket = {this.handleEditingTicketInList} />
        buttonText = "Return to Ticket List";
      } else if (this.state.selectedTicket != null) {
        currentlyVisibleState = <TicketDetail ticket = {this.state.selectedTicket} onClickingDelete = {this.handleDeletingTicket} 
        onClickingEdit= {this.handleEditClick} />
        buttonText = "Return to Ticket List";
      } else if (this.props.formVisibleOnPage) {
        currentlyVisibleState = <NewTicketForm onNewTicketCreation={this.handleAddingNewTicketToList} />
        buttonText = "Return To Ticket List";
      } else {
        currentlyVisibleState = <TicketList onTicketSelection={this.handleChangingSelectedTicket} />
        buttonText = "Add Ticket";
      }
      return (
        <React.Fragment>
          {currentlyVisibleState}
          <div className="flex justify-center">  
            <button onClick={this.handleClick}>{buttonText}</button>
          </div>
        </React.Fragment>
      );
    }
  }
}

TicketControl.propTypes = {
  mainTicketList: PropTypes.object,
  formVisibleOnPage: PropTypes.bool
};

const mapStateToProps = state => {
  return {
    formVisibleOnPage: state.formVisibleOnPage
  }
}

TicketControl = connect(mapStateToProps)(TicketControl);

export default withFirestore(TicketControl);
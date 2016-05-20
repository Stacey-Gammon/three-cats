'use strict'

import * as React from 'react';

var ReactRouterBootstrap = require('react-router-bootstrap');
var LinkContainer = ReactRouterBootstrap.LinkContainer;
var ReactBootstrap = require('react-bootstrap');
var DropdownMenu = ReactBootstrap.DropdownMenu;
var ButtonGroup = ReactBootstrap.ButtonGroup;
var DropdownButton = ReactBootstrap.DropdownButton;
var Button = ReactBootstrap.Button;
var MenuItem = ReactBootstrap.MenuItem;

import Volunteer from '../../core/databaseobjects/volunteer';
import ConstStrings from '../../core/conststrings';
import LoginStore from '../../stores/loginstore';
import VolunteerStore from '../../stores/volunteerstore';
import AnimalStore from '../../stores/animalstore';
import PermissionsStore from '../../stores/permissionsstore';
import AnimalActivityStore from '../../stores/animalactivitystore';
import Activity from '../../core/databaseobjects/activity';
import Permission from '../../core/databaseobjects/permission';

import ActivityBody from './activitybody';

export default class ActivityElement extends React.Component<any, any> {
  // Required for page transitions via this.context.router.push.
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      memberName: 'loading...',
    };
  }

  componentWillMount() {
    VolunteerStore.ensureItemById(this.props.activity.userId).then(function(val) {
      var member = VolunteerStore.getVolunteerById(this.props.activity.userId);
      if (!member) {
        console.log('ERROR: ensured promised to get volunter with id ' + this.props.activity.userId + ' failed with val ', val);
        return;
      }
      this.setState({ memberName: member.name });
    }.bind(this));
  }

  componentWillUnmount() {
    VolunteerStore.removePropertyListener(this);
  }

  shouldComponentUpdate(newProps, newState) {
    return newState.permission != this.props.permission ||
      newProps.activity != this.props.activity ||
      newState.memberName != this.state.memberName;
  }

  onChange() {
    this.forceUpdate();
  }

  deleteAction(event) {
    if (confirm("Are you sure you want to delete this post?")) {
      this.props.activity.delete();
    }
  }

  editAction() {
    this.context.router.push({
      pathname: "addAnimalNote",
      state: { animalId: this.props.activity.animalId,
               activityId: this.props.activity.id,
               groupId: this.props.activity.groupId,
               mode: 'edit' } });
  }

  getActionDropDown() {
    return (
      <div className='dropdown activity-dropdown'>
        <DropdownButton title="">
          <MenuItem eventKey="1" onClick={this.editAction.bind(this)}>Edit</MenuItem>
          <MenuItem eventKey="2" onClick={this.deleteAction.bind(this)}>Delete</MenuItem>
        </DropdownButton>
      </div>
    );
  }

  getDeleteActionButton() {
    return (
      <div>
        <span onClick={this.deleteAction.bind(this)}
          className="glyphicon glyphicon-remove-circle"/>
      </div>
    );
  }

  getActions() {
    if (!LoginStore.getUser()) return null;
    if (this.props.activity.userId == LoginStore.getUser().id ||
      this.props.permission.admin()) {
      return (
        <div className="media-right">
          {this.getActionDropDown()}
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    var date = this.props.activity.getDateForDisplay();
    var userAndDateInfo = " - " + this.state.memberName + " - " + date;
    return (
      <div className="list-group-item activity-list-item">
        <div className="media">
          <div className="media-body">
            <ActivityBody activity={this.props.activity}/>
            <p>
            <a><LinkContainer
              to={{ pathname: "/memberPage",
                state: {
                  userId: this.props.activity.userId,
                  groupId: this.props.activity.groupId
                } }}>
              <button className="invisible-button">{this.state.memberName}</button>
            </LinkContainer>
            </a>
            {date}
            </p>

          </div>
          {this.getActions()}
        </div>
      </div>
    );
  }
}

﻿'use strict'

import * as React from 'react';
var ReactRouterBootstrap = require('react-router-bootstrap');
var LinkContainer = ReactRouterBootstrap.LinkContainer;

import Utils from '../uiutils';

import ProfilePic from './profilepic';

import Group from '../../core/databaseobjects/group';
import Volunteer from '../../core/databaseobjects/volunteer';
import ConstStrings from '../../core/conststrings';
import DataServices from '../../core/dataservices';
import LoginStore from '../../stores/loginstore';
import GroupStore from '../../stores/groupstore';
import VolunteerStore from '../../stores/volunteerstore';
import PermissionsStore from '../../stores/permissionsstore';

export default class MemberListItem extends React.Component<any, any> {
  // Required for page transitions via this.context.router.push.
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      imgUrl: null
    };
  }

  componentDidMount() {
    LoginStore.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    LoginStore.removeChangeListener(this.onChange);
  }

  onChange() {
    this.setState({});
  }

  approveMembership(event) {
    // This is a hack because a parent LinkContainer element is
    // redirecting the user to another page.
    event.stopPropagation();
    this.props.memberPermission.setMember();
    this.props.memberPermission.update();
    DataServices.PushFirebaseData('emails/tasks',
      {
        eventType: 'REQUEST_APPROVED',
        userEmail: this.props.member.email,
        groupName: this.props.group.name
       });
  }

  denyMembership(event) {
    // This is a hack because a parent LinkContainer element is
    // redirecting the user to another page.
    event.stopPropagation();

    this.props.memberPermission.setDenied();
    this.props.memberPermission.update();
  }

  getApproveMembershipButton() {
    var text = this.props.memberPermission.pending() ? "Approve" : "";
    if (text != "") {
      return (
        <div>
          <button className="btn btn-info" onClick={this.approveMembership.bind(this) }>
          {text}
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  getBootMembershipButton() {
    var text = this.props.memberPermission.pending() ? "Deny" : "Remove";
    if (this.props.memberPermission.pending() || this.props.memberPermission.member()) {
      return (
        <div>
          <button className="btn btn-warning" onClick={this.denyMembership}>{text}</button>
        </div>
      );
    } else {
      return null;
    }
  }

  getActions() {
    var buttons = [];
    var approveButton = this.getApproveMembershipButton();
    if (approveButton) { buttons.push(approveButton); }

    if ((this.props.manageMode || approveButton) && this.props.permission.admin()) {
      var removeButton = this.getBootMembershipButton();
      if (removeButton) { buttons.push(removeButton); }
    }

    if (buttons.length == 0) {
      return null;
    } else {
      return (
        <div className="media-right">
          {buttons}
        </div>
      );
    }
  }

  render() {
    if (!LoginStore.getUser()) return null;

    var memberPermission = this.props.memberPermission;
    var userPermission = this.props.permission;

    if (!userPermission || !memberPermission || memberPermission.notInGroup()) return null;

    var className = "list-group-item memberListElement";

    if (memberPermission.denied()) {
      if (userPermission.admin()) {
        className += " membershipRevokedStyle";
      } else {
        // Regular members can't see members denied by the admin.
        return null;
      }
    }

    if (memberPermission.pending()) {
      if (userPermission.admin() ||
        (LoginStore.getUser() && this.props.member.id == LoginStore.getUser().id)) {
          className += " membershipPendingStyle";
      } else {
        // Regular members can't see members pending.
        return null;
      }
    }

    var extraInfo = memberPermission.admin() ? "(admin)" : "";
    if (userPermission.admin() ||
      (LoginStore.getUser() && this.props.member.id == LoginStore.getUser().id)) {
      extraInfo = memberPermission.pending() ?
        "(membership pending)" :
        memberPermission.denied() ?
        "(membership denied)" : extraInfo;
    }
    return (
      <a href="#" className="list-group-item member-list-item">
        <LinkContainer to={{ pathname: "memberPage" ,
          state: { member: this.props.member, groupId: this.props.group.id} }}>
          <div className="media">
            <div className='media-left'>
              <ProfilePic user={this.props.member}/>
            </div>
            <div className="media-body">
              <h2>{this.props.member.name} {extraInfo}</h2>
            </div>
            {this.getActions()}
          </div>
        </LinkContainer>
      </a>
    );
  }
}

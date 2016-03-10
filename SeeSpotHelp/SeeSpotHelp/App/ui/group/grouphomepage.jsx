﻿"use strict";

var React = require("react");
/* eslint-disable no-unused-vars */
var Link = require("react-router").Link;
var ReactBootstrap = require("react-bootstrap");
var Tab = ReactBootstrap.Tab;
var Tabs = ReactBootstrap.Tabs;

var GroupInfoBox = require("./groupinfobox");
var GroupMembersTab = require("./groupmemberstab");
var GroupAnimalsTab = require("./groupanimalstab");
var GroupActivityTab = require("./groupactivitytab");
var GroupActionsBox = require("./groupactionsbox");
/* eslint-enable no-unused-vars */

var Utils = require("../../core/utils");
var VolunteerGroup = require("../../core/volunteergroup");
var LoginStore = require("../../stores/loginstore");
var GroupStore = require("../../stores/groupstore");

var GroupHomePage = React.createClass({
	getInitialState: function() {
		var query = this.props.location ? this.props.location.query : null;
		var group = null;
		if (query && query.groupId) {
			group = GroupStore.getGroupById(query.groupId);
		} else {
			group = Utils.FindPassedInProperty(this, 'group');
			// Force refresh via groupstore
			group = group ? GroupStore.getGroupById(group.id) : null;
		}

		var state = {
			user: LoginStore.user,
			group: group,
			fromSearch: query && query.groupId
		};

		Utils.LoadOrSaveState(state);
		return state;
	},

	loadDifferentGroup: function(group) {
		this.setState({
			group: group
		});
	},

	getPreviousButton: function() {
		if (this.state.fromSearch || !this.state.user) return null;
		var usersGroups = GroupStore.getUsersMemberGroups(this.state.user);
		var previousGroup = null;
		for (var i = 0; i < usersGroups.length; i++) {
			if (usersGroups[i].id == this.state.group.id) {
				break;
			}
			previousGroup = usersGroups[i];
		}
		if (previousGroup) {
			return (
				<button className="btn btn-default"
						onClick={this.loadDifferentGroup.bind(this, previousGroup)}>
					Prev
				</button>
			);
		}
	},

	getNextButton: function() {
		if (this.state.fromSearch || !this.state.user) return null;
		var usersGroups = GroupStore.getUsersMemberGroups(this.state.user);
		var nextGroup = null;
		var groupFound = false;
		for (var i = 0; i < usersGroups.length; i++) {
			if (groupFound) {
				nextGroup = usersGroups[i];
				break;
			}
			if (usersGroups[i].id == this.state.group.id) {
				groupFound = true;
			}
		}
		if (nextGroup) {
			return (
				<button className="btn btn-default"
						onClick={this.loadDifferentGroup.bind(this, nextGroup)}>
					Next
				</button>
			);
		}
	},

	componentDidMount: function() {
		LoginStore.addChangeListener(this.onChange);
		GroupStore.addChangeListener(this.onChange);
	},

	componentWillMount: function() {
	},

	componentWillUnmount: function() {
		LoginStore.removeChangeListener(this.onChange);
		GroupStore.removeChangeListener(this.onChange);
	},

	onChange: function() {
		this.setState(
			{
				user: LoginStore.user,
				group: this.state.group ? GroupStore.getGroupById(this.state.group.id) : null
			});
	},

	render: function() {
		if (this.state.group) {
			var memberTitle = "Members (" + this.state.group.memberCount() + ")";
			return (
				<div>
					<div className="media">
						<div className="media-left">
							{this.getPreviousButton()}
						</div>
						<div className="media-body">
							<GroupInfoBox group={this.state.group} user={this.state.user} />
						</div>
						<div className="media-right">
							{this.getNextButton()}
						</div>
					</div>
					<GroupActionsBox user={this.state.user} group={this.state.group} />
					<Tabs defaultActiveKey={1}>
						<Tab eventKey={1} title="Animals">
							<GroupAnimalsTab group={this.state.group} user={this.state.user}/>
						</Tab>
						<Tab eventKey={2} title={memberTitle}>
							<GroupMembersTab group={this.state.group} user={this.state.user}/>
						</Tab>
						<Tab eventKey={3} title="Activity">
							<GroupActivityTab group={this.state.group} user={this.state.user}/>
						</Tab>
					</Tabs>
				</div>
			);
		} else if (LoginStore.user) {
			return (
				<div>
					<h1>
						You are not part of any volunteer groups.  To get started&nbsp;
					<Link to="searchPage">search</Link>
						&nbsp;for a group to join, or&nbsp;
					<Link to="addNewGroup">add</Link> a new one.
					</h1>
				</div>
			);
		} else {
			return (
			<div>
				<h1>To get started&nbsp;
				<Link to="searchPage">search</Link>
					&nbsp;for a group, or <Link to="loginPage">log in</Link> to join or add one.
				</h1>
			</div>
		);
		}
	}
});

module.exports = GroupHomePage;

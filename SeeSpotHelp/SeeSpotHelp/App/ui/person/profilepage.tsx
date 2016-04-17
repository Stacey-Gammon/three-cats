﻿"use strict";

var React = require("react");
import Utils from '../../core/utils';
var FacebookLogin = require("../facebooklogin");
var GroupInfoBox = require("../group/groupinfobox");
var AddNewGroup = require("../group/addnewgroup");
var SearchPage = require("../searchpage");
var MemberScheduleTab = require("./memberscheduletab");
var LoginPage = require("../loginpage");

var UserGroupsTab = require("./usergroupstab");
var UserActivityTab = require("./useractivitytab");
var ReactBootstrap = require("react-bootstrap");
var Tab = ReactBootstrap.Tab;
var Tabs = ReactBootstrap.Tabs;
var ReactRouterBootstrap = require("react-router-bootstrap");

import Volunteer from '../../core/volunteer';
import VolunteerGroup from '../../core/volunteergroup';
import GroupStore from '../../stores/groupstore';
import VolunteerStore from '../../stores/volunteerstore';
import LoginStore from '../../stores/loginstore';

var ProfilePage = React.createClass({
	contextTypes: {
		router: React.PropTypes.object.isRequired
	},

	getInitialState: function () {
		var state = {
			user: LoginStore.getUser()
		};
		Utils.LoadOrSaveState(state);
		return state;
	},

	componentWillMount: function () {
		console.log('profilepage:componentWillMount');

		// There is no user and none is going to be downloaded, we must prompt them to log in.
		// TODO: when we open the app up to the public, we must be able to handle non-logged in
		// users.
		if (!LoginStore.getUser() && !LoginStore.userDownloading) {
			console.log('profilepage: pushing to private beta');
			this.context.router.push("/privatebetapage");
		}
	},

	componentDidMount: function () {
		LoginStore.addChangeListener(this.onChange);
		GroupStore.addChangeListener(this.onChange);
	},

	componentWillUnmount: function () {
		console.log('Profile page unmounted');
		LoginStore.removeChangeListener(this.onChange);
		GroupStore.removeChangeListener(this.onChange);
	},

	onChange: function () {
		if (!LoginStore.getUser() && !LoginStore.userDownloading) {
			this.context.router.push("/privatebetapage");
		}
		this.setState(
			{
				user: LoginStore.getUser()
			});
	},

	handleTabSelect: function(key) {
		console.log("handleTabSelect: ", key);
		this.setState({profileDefaultTabKey : key});
		// We aren't supposed to manipulate state directly, but it doesn't yet have the newly
		// selected tab that we want to save to local storage.
		var stateDuplicate = this.state;
		stateDuplicate.groupDefaultTabKey = key;
		Utils.LoadOrSaveState(stateDuplicate);
	},

	render: function () {
		console.log('profilepage: render');
		if (!LoginStore.getUser()) return null;
		var defaultKey = this.state.profileDefaultTabKey ? this.state.profileDefaultTabKey : 1;
		var heading = "Hello, " + LoginStore.getUser().name;
		return (
			<div className="page">
				<div className="media info-top">
					<div className="media-body">
					<h1>{heading}</h1>
					</div>
				</div>
				<Tabs className="tabs-area" activeKey={defaultKey} onSelect={this.handleTabSelect}>
					<Tab className="tab" eventKey={1} title="Groups">
						<UserGroupsTab user={LoginStore.getUser()}/>
					</Tab>
					<Tab className="tab" eventKey={2} title={Utils.getActivityGlyphicon()}>
						<UserActivityTab user={LoginStore.getUser()}/>
					</Tab>
					<Tab className="tab" eventKey={3} title={Utils.getCalendarGlyphicon()}>
						<MemberScheduleTab view="profile"/>
					</Tab>
				</Tabs>
			</div>
		);
	}
});

module.exports = ProfilePage;

﻿"use strict"

var React = require("react");
var Link = require("react-router").Link;
var Volunteer = require("../core/volunteer");
var VolunteerGroup = require("../core/volunteergroup");
var FacebookLogin = require("./facebooklogin");
var GroupInfoBox = require("./group/groupinfobox");
var AddNewGroup = require("./group/addnewgroup");
var SearchPage = require("./searchpage");
var LoginStore = require("../stores/loginstore");
var GroupStore = require("../stores/groupstore");
var LoginActions = require("../actions/loginactions");
var GroupListItem = require("./group/grouplistitem");

var ProfilePage = React.createClass({
    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    getInitialState: function () {
        console.log("ProfilePage:getInitialState");
        var user = LoginStore.user;
        var groups = GroupStore.getUsersMemberGroups(user);
        console.log("groups = ");
        console.log(groups);
        return {
            user: user,
            groups: groups
        }
    },

    componentDidMount: function () {
        LoginStore.addChangeListener(this.onChange);
        GroupStore.addChangeListener(this.onChange);
    },

    componentWillUnmount: function () {
        LoginStore.removeChangeListener(this.onChange);
        GroupStore.removeChangeListener(this.onChange);
    },

    onChange: function () {
        this.setState(
            {
                user: LoginStore.user,
                groups: GroupStore.getUsersMemberGroups(LoginStore.user)
            });
    },

    getGroupElement: function(group) {
        console.log("ProfilePage:GetGroupElement");
        return (
            <GroupListItem user={this.state.user} group={group}/>
        );
    },

    getGroups: function() {
        console.log("ProfilePage:getGroups");
        if (this.state.groups.length == 0 && GroupStore.loadedUserGroups) {
            return (
                <div>
                    <h1>You are not part of any volunteer groups.  To get started&nbsp;
                    <Link to="shelterSearchPage">search</Link>
                    &nbsp;for a group to join, or&nbsp;
                    <Link to="AddNewGroup">add</Link> a new one.
                    </h1>
                </div>
            );
        } else if (this.state.groups.length) {
            var groups = this.state.groups.map(this.getGroupElement);
            return (
                <div>
                    {groups}
                    <div>
                        <h1>
                        <Link to="shelterSearchPage">Search</Link>
                            &nbsp;for a new group to join, or&nbsp;
                        <Link to="AddNewGroup">add</Link> your own!
                        </h1>
                    </div>
                </div>
            );
        } else {
            return <div></div>
        }
    },

    render: function () {
        console.log("ProfilePage::render");
        if (this.state.user) {
            return (
                <div>
                    <h1>Hello, {this.state.user.name}</h1>
                    <h2>Email: {this.state.user.email}</h2>
                    <hr/>
                    {this.getGroups()}
                    <br/><br/>
                    <FacebookLogin />
                </div>
            );
        } else {
            return (
                <div>
                    <h1>To get started, log in with facebook</h1>
                    <FacebookLogin />
                </div>
            );
        }
    }
});

module.exports = ProfilePage;

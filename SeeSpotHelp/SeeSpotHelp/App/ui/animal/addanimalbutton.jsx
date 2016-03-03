"use strict"

var React = require("react");
var ReactRouterBootstrap = require('react-router-bootstrap');
var LinkContainer = ReactRouterBootstrap.LinkContainer;

var VolunteerGroup = require("../../core/volunteergroup");
var Volunteer = require("../../core/volunteer");
var LoginStore = require("../../stores/loginstore");
var GroupStore = require("../../stores/groupstore");

var AddAdoptableButton = React.createClass({
    getInitialState: function() {
        var user = LoginStore.getUser();
        var group = this.props.group ? VolunteerGroup.castObject(this.props.group) : null;
        var permissions = user && group ? group.getUserPermissions(user.id) : null;

        return {
            user: user,
            group: group,
            permissions: permissions
        };
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
        var user = LoginStore.getUser();
        var group = this.state.group ? GroupStore.getGroupById(this.state.group.id) : null;
        this.setState(
            {
                user: user,
                group: group,
                permissions: user && group ? group.getUserPermissions(user.id) : null
            });
    },

    getAddAdoptableButton: function () {
        if (!this.state.user ||
            this.state.permissions == VolunteerGroup.PermissionsEnum.NONMEMBER ||
            this.state.permissions == VolunteerGroup.PermissionsEnum.PENDINGMEMBERSHIP ||
            this.state.permissions == VolunteerGroup.PermissionsEnum.MEMBERSHIPDENIED) {
            return null;
        }
        return (
            <LinkContainer
                to={{ pathname: "addAnimalPage",
                    state: { user: this.state.user, group: this.state.group } }}>
                <button className="btn btn-info addAdoptableButton buttonPadding">
                    <span className="glyphicon glyphicon-plus"/>
                    &nbsp;Animal
                </button>
            </LinkContainer>
        );
    },

    render: function () {
        console.log("AddAdoptableButton:render:");
        return (
            <div>
                {this.getAddAdoptableButton()}
            </div>
        );
    }
});

module.exports = AddAdoptableButton;

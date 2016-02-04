﻿var React = require("react");
var ReactTestUtils = require("react-addons-test-utils");
var expect = require("expect"),
    Volunteer = require("../scripts/volunteer"),
    VolunteerGroup = require("../scripts/volunteergroup"),
    ConstStrings = require("../scripts/conststrings"),
    ShelterActionsBox = require("../ui/shelteractionsbox.jsx");

var d3 = require("d3");

describe("ShelterActionsBox", function () {
    it("LeaveButtonForMember", function () {
        var volunteer = new Volunteer("Sally", "sally@sally.com", "115");
        var group = new VolunteerGroup("Group name", "shelter name", "address", "25");
        group.userPermissionsMap["115"] = VolunteerGroup.PermissionsEnum.MEMBER;

        var shelterActionsBox = ReactTestUtils.renderIntoDocument(
            <ShelterActionsBox user={volunteer} group={group}/>
        );

        ReactTestUtils.findRenderedDOMComponentWithClass(
            shelterActionsBox, "leaveShelterButton");
    });

    it("NoLeaveButtonForNonMember", function () {
        var volunteer = new Volunteer("Sally", "sally@sally.com", "115");
        var group = new VolunteerGroup("Group name", "shelter name", "address", "25");

        var shelterActionsBox = ReactTestUtils.renderIntoDocument(
            <ShelterActionsBox user={volunteer} group={group}/>
        );

        var leaveButtons = ReactTestUtils.scryRenderedDOMComponentsWithClass(
            shelterActionsBox, "leaveShelterButton");
        expect(leaveButtons.length).toEqual(0);
    });

    it("RequestJoinButtonForNonMember", function () {
        var volunteer = new Volunteer("Sally", "sally@sally.com", "115");
        var group = new VolunteerGroup("Group name", "shelter name", "address", "25");

        var shelterActionsBox = ReactTestUtils.renderIntoDocument(
            <ShelterActionsBox user={volunteer} group={group}/>
        );

        ReactTestUtils.findRenderedDOMComponentWithClass(
            shelterActionsBox, "requestToJoinButton");
    });
    
    it("NoRequestJoinButtonForNotLoggedIn", function () {
        var group = new VolunteerGroup("Group name", "shelter name", "address", "25");

        var shelterActionsBox = ReactTestUtils.renderIntoDocument(
            <ShelterActionsBox user={null} group={group}/>
        );

        var leaveButtons = ReactTestUtils.scryRenderedDOMComponentsWithClass(
            shelterActionsBox, "requestToJoinButton");
        expect(leaveButtons.length).toEqual(0);
    });

    it("NoRequestJoinButtonForMember", function () {
        var volunteer = new Volunteer("Sally", "sally@sally.com", "115");
        var group = new VolunteerGroup("Group name", "shelter name", "address", "25");
        group.userPermissionsMap["115"] = VolunteerGroup.PermissionsEnum.MEMBER;

        var shelterActionsBox = ReactTestUtils.renderIntoDocument(
            <ShelterActionsBox user={volunteer} group={group}/>
        );

        var leaveButtons = ReactTestUtils.scryRenderedDOMComponentsWithClass(
            shelterActionsBox, "requestToJoinButton");
        expect(leaveButtons.length).toEqual(0);
    });

    it("RequestPendingButtonForPendingMember", function () {
        var user = new Volunteer("Sally", "sally@sally.com", "115");
        var group = new VolunteerGroup("Group name", "shelter name", "address", "25");
        group.userPermissionsMap["115"] = VolunteerGroup.PermissionsEnum.PENDINGMEMBERSHIP;

        var shelterActionsBox = ReactTestUtils.renderIntoDocument(
            <ShelterActionsBox user={user} group={group}/>
        );

        var requestToJoinButton = ReactTestUtils.findRenderedDOMComponentWithClass(
            shelterActionsBox, "requestToJoinButton");
        expect(requestToJoinButton.innerHTML).toEqual(ConstStrings.JoinRequestPending);
        expect(requestToJoinButton.disabled).toEqual(true);
    });
});

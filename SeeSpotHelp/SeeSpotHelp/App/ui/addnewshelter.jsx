﻿"use strict"

var React = require("react");
var ConstStrings = require("../core/conststrings");
var VolunteerGroup = require("../core/volunteergroup");
var InputField = require("../core/inputfield");
var InputFieldValidation = require("../core/inputfieldvalidation");
var LoginStore = require("../stores/loginstore");

var STATES = [
    "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI",
    "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
    "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR",
    "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

var AddNewShelter = React.createClass({
    getInitialState: function () {
        console.log("AddNewShelter::getInitialState");
        // for short hand.
        var IFV = InputFieldValidation;
        var inputFields = {
            "name": new InputField([IFV.validateNotEmpty]),
            "shelter": new InputField([IFV.validateNotEmpty]),
            "address": new InputField([IFV.validateNotEmpty]),
            "city": new InputField([IFV.validateNotEmpty]),
            "state": new InputField([IFV.validateNotEmpty]),
            "zipCode": new InputField([IFV.validateNotEmpty])
        };
        // Store the ref name on the input field without manually
        // writing it out twice.
        for (var field in inputFields) {
            inputFields[field].ref = field;
        }
        
        var editMode = this.props.editMode ? this.props.editMode :
            this.props.location  && this.props.location.state ?
            this.props.location.state.editMode : null;
        var group = this.props.group ? this.props.group :
            this.props.location && this.props.location.state ?
            this.props.location.state.group : null;

        // If in edit mode, fill in field values.
        if (editMode) {
            for (var field in inputFields) {
                inputFields[field].value = group[field];
            }
        }

        return {
            errorMessage: null,
            fields: inputFields,
            user : LoginStore.user,
            group: group,
            editMode: editMode
        };
    },

    validateFields: function () {
        console.log("AddNewShelter::validateFields");
        var errorFound = false;
        for (var key in this.state.fields) {
            var field = this.state.fields[key];
            field.value = this.refs[field.ref].value;
            field.validate();
            if (field.hasError) {
                console.log("Error found with field " + field.ref);
                errorFound = true;
            }
        }
        // Forces a re-render based on the new validation states for each
        // field.
        if (errorFound) {
            console.log("Error found!");
            this.setState({ fields: this.state.fields });
        }
        return errorFound;
    },

    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    insertGroupCallback: function (group, serverResponse) {
        console.log("AddNewShelter::insertGroupCallback");
        if (serverResponse.hasError) {
            // Show error message to user.
            this.setState({ errorMessage: serverResponse.errorMessage });
        } else {
            this.context.router.push(
                {
                    pathname: "shelterHomePage",
                    state: {
                        group:  group
                    }
                });
        }
    },

    addNewVolunteerGroup: function () {
        console.log("AddNewShelter:addNewVolunteerGroup");
        var errorFound = this.validateFields();
        if (!errorFound) {
            if (this.state.editMode) {
                this.state.group.updateFromInputFields(this.state.fields);
                this.state.group.update(this.insertGroupCallback);
            } else {
                var group = VolunteerGroup.createFromInputFields(
                    this.state.fields,
                    this.state.user.id);
                group.insert(this.state.user.id, this.insertGroupCallback);
            }
        }
    },

    createInputField: function (inputField) {
        var inputFieldClassName = "form-control " + inputField.ref;
        return (
            <div className={inputField.getFormGroupClassName()}>
                {inputField.getErrorLabel()}
                <div className="input-group">
                    <span className="input-group-addon">{inputField.getUserString()}</span>
                    <input type="text"
                           ref={inputField.ref}
                           id={inputField.ref}
                           className={inputFieldClassName}
                           defaultValue={inputField.value}/>
                </div>
                {inputField.getValidationSpan()}
            </div>
        );
    },

    render: function () {
        console.log("AddNewShelter: render");
        if (this.state.user == null) {
            throw "Non logged in user is attempting to add a new shelter";
        }
        var inputFields = [];
        for (var key in this.state.fields) {
            var field = this.state.fields[key];
            inputFields.push(this.createInputField(field));
        }
        var buttonText = this.state.editMode ? ConstStrings.Update : ConstStrings.Add;
        return (
            <div>
                {this.state.errorMessage}
                {inputFields}
                <button className="btn btn-primary addNewGroupButton"
                onClick={this.addNewVolunteerGroup}>{buttonText}</button>
            </div>
        );
    }
});

module.exports = AddNewShelter;

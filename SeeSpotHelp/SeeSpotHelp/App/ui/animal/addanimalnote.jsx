var React = require("react");

var AnimalNote = require("../../core/animalnote");
var Utils = require("../../core/utils");

var LoginStore = require("../../stores/loginstore");
var GroupStore = require("../../stores/groupstore");

var AddAnimalNote = React.createClass({
	getInitialState: function() {
		var editMode = Utils.FindPassedInProperty(this, "editMode");
		var animal = Utils.FindPassedInProperty(this, "animal");
		var group = Utils.FindPassedInProperty(this, "group");
		var activity = Utils.FindPassedInProperty(this, "activity");
		var user = LoginStore.getUser();

		return {
			user: user,
			animal: animal,
			editMode: editMode,
			group: group,
			activity: activity
		};
	},

	// Required for page transitions via this.context.router.push.
	contextTypes: {
		router: React.PropTypes.object.isRequired
	},

	// Listen for changes made to the group in case the user was banned or membership was approved,
	// we'll need up update the actions they can use.
	componentDidMount: function() {
		GroupStore.addChangeListener(this.onChange);
	},

	componentWillUnmount: function() {
		GroupStore.removeChangeListener(this.onChange);
	},

	onChange: function() {
		var user = LoginStore.getUser();
		var group = this.state.group ? GroupStore.getGroupById(this.state.group.id) : null;
		this.setState(
			{
				user: user,
				group: group
			});
	},

	submitNote: function() {
		if (this.state.editMode) {
			this.state.activity.note = this.refs.note.value;
			this.state.activity.update();
		} else {
			var note = new AnimalNote(
				this.refs.note.value,
				this.state.animal.id,
				this.state.group.id,
				this.state.user.id);
			note.insert();
		}

		if (this.state.animal) {
			this.context.router.push(
				{
					pathname: "animalHomePage",
					state: {
						group: this.state.group,
						animal: this.state.animal,
						user: this.state.user
					}
				});
		} else {
			this.context.router.push(
				{
					pathname: "groupHomePage",
					state: {
						group: this.state.group,
						user: this.state.user
					}
				});
		}
	},

	render: function() {
		console.log("AddAnimalNote:render:");
		var value = this.state.editMode ? this.state.activity.note : "";
		var buttonText = this.state.editMode ? "Update" : "Post";
		return (
			<div>
				<textarea
					className="form-control"
					ref="note"
					rows="5"
					id="comment"
					defaultValue={value}>
				</textarea>
				<button className="btn btn-primary" onClick={this.submitNote}>
					{buttonText}
				</button>
			</div>
		);
	}
});

module.exports = AddAnimalNote;

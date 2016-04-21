'use strict'

import * as React from 'react';

import InputFields from './inputfields';
import AddOrEditButtonBar from './addoreditbuttonbar';

import GroupEditor from '../../core/editor/groupeditor';
import Utils from '../../core/utils';
import VolunteerGroup from '../../core/databaseobjects/volunteergroup';
import Permission from '../../core/databaseobjects/permission';
import InputField from '../../core/inputfield';
import InputFieldValidation from '../../core/inputfieldvalidation';

import LoginStore from '../../stores/loginstore';

export default class EditorElement extends React.Component<any, any> {
	public refs: any;

	constructor(props) {
		super(props);
	}

	validateFields() {
		var validated = this.props.editor.validateFields();
		if (!validated) { this.forceUpdate(); }
		return validated;
	}

	edit() {
		this.refs.inputFields.fillWithValues(this.props.editor.getInputFields());
		if (this.validateFields()) {
			this.props.editor.update(LoginStore.getUser());
			this.props.onEditOrInsert();
		}
	}

	insert() {
		this.refs.inputFields.fillWithValues(this.props.editor.getInputFields());
		if (this.validateFields()) {
			this.props.editor.insert(LoginStore.getUser());
			this.props.onEditOrInsert();
		}
	}

	delete() {
		if (confirm('Are you sure you wish to permanently delete?')) {
			this.props.editor.delete();
			this.props.onDelete();
		}
	}

	render() {
		return (
			<div>
				<InputFields ref='inputFields' fields={this.props.editor.getInputFields()}/>
				<AddOrEditButtonBar
					mode={this.props.mode}
					permission={this.props.permission}
					onAdd={this.insert.bind(this)}
					onEdit={this.edit.bind(this)}
					onDelete={this.delete.bind(this)}/>
			</div>
		);
	}
}

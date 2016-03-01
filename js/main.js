import React from "react";
import {render} from 'react-dom';

class Main extends React.Component {
	constructor(oProps) {
		super(oProps);
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			clickCount: 0,
		};
	}
	render() {
		return <div>
			<a href="" onClick={this.handleClick}>Clicks Player: {this.state.clickCount}</a>
			<ListTest listItems={this.props.listItems}/>
		</div>;
	}
	handleClick(event) {
		event.preventDefault();
		this.setState({
			clickCount: this.state.clickCount + 1,
		});
	}
}

class ListTest extends React.Component
{
	constructor(oProps)
	{
		super(oProps);
		this.handleClick = this.handleClick.bind(this);
	}

	render()
	{
		var aItems = this.props.listItems.map(
			function(oI)
			{
				return(
					<div className="list-item">{oI.name}</div>
				)
			}
		)

		return (
			<div className="items">{aItems}</div>
		)
	}

	handleClick(event)
	{
		event.preventDefault();
	}
}

var aData =
[
	{id:"r0", name:"Bob"},
	{id:"r1", name:"Doug"}
];

var oNewContact = {name:"", description:"", email:""};

class ContactForm extends React.Component
{
	constructor(oProps)
	{
		super(oProps);
	}

	render()
	{
		return (
			<form>
				<input type="text" placeholder="Name (req)" value={this.props.contact.name}></input>
				<input type="text" placeholder="Email" value={this.props.contact.email}></input>
				<textarea placeholder="description" value={this.props.contact.description}></textarea>
				<button type="submit">Add Contact</button>
			</form>
		)
	}
}

ContactForm.propTypes = {contact:React.PropTypes.object.isRequired};

render((
	<div>
		<Main listItems={aData}/>
		<ContactForm contact={oNewContact}/>
	</div>
), document.getElementById('main'));

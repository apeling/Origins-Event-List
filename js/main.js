import React from "react";
import {render} from 'react-dom';

class Main extends React.Component {
	constructor(oProps)
	{
		super(oProps);
		// this.handleClick = this.handleClick.bind(this);
		this.state = {
			clickCount: 0
		};
	};

	render()
	{
		return <div>
			<a href="" onClick={(e)=>this.handleClick(e)}>Clicks Player: {this.state.clickCount}</a>
			{/*<a href="" onClick={this.handleClick}>Clicks Player: {this.state.clickCount}</a>*/}
			<ListTest listItems={this.props.listItems}/>
		</div>;
	};

	handleClick(event)
	{
		event.preventDefault();
		this.setState({
			clickCount: this.state.clickCount + 1,
		});
	};
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
					<li key={oI.key} className="list-item">
						<h3>{oI.name}</h3>
						<a href={oI.email}>{oI.email}</a>
						<p>{oI.description}</p>
					</li>
				)
			}
		)

		return (
			<ul className="items">{aItems}</ul>
		)
	}

	handleClick(event)
	{
		event.preventDefault();
	}
}
ListTest.propTypes =
{
	listItems:React.PropTypes.array.isRequired
}

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

ContactForm.propTypes =
{
	contact:React.PropTypes.object.isRequired,
};

class MainView extends React.Component
{
	constructor(oProps)
	{
		super(oProps);
	}

	render()
	{
		return (
			<div className={this.props.cssName}>
				<Main listItems={this.props.contacts}/>
				<ContactForm contact={this.props.newContact}/>
			</div>
		);
	}
}

MainView.propTypes =
{
	contacts:React.PropTypes.array.isRequired,
	newContact:React.PropTypes.object.isRequired,
	cssName:React.PropTypes.string.isRequired
}

var aData =
[
	{key:"r0", name:"Bob", email:"bob@bob.com", description:"Makes the bacon"},
	{key:"r1", name:"Doug", email:"doug@bob.com"},
	{key:"r2", name:"Ain't having it"},
];

var oNewContact = {name:"", description:"", email:""};

render((
		<MainView contacts={aData} newContact={oNewContact} cssName="got-monkey"/>

), document.getElementById('main'));

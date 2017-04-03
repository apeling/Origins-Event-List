import React from "react";
import {render} from 'react-dom';

class Main extends React.Component
{
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
			<ListTest listItems={this.props.listItems} filter={this.props.filter}/>
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
		const oFilter = this.props.filter;
		let sCategory = oFilter !== null && oFilter.category !== null ? oFilter.category : null;
		let sValue = oFilter !== null && oFilter.value !== null ? oFilter.value : null;
		var aItems = this.props.listItems.map(
			function(oI)
			{
				let bAllow = true;
				if(sCategory !== null && sValue !== null)
				{
					bAllow = oI[sCategory] === sValue;
				}
				if (bAllow)
				{
					return(
						<li className="list-item">
							<span><b>{oI["EventName"]}</b> | <span>{oI["EventStartDate"]} : {oI["EventStartTime"]} ({oI["EventDuration"]} hours)</span></span>
							<div><b>Category:</b> {oI["EventCategory"]}| <b>Players:</b> {oI["MaximumPlayers"]} | <b>Complexity:</b> {oI["GameComplexity"]}</div>
							<div><b>Manufacturer:</b> {oI["GameManufacturer"]}| <b>System:</b> {oI["GameSystem"]} | <b>Host:</b> {oI["HostingCompanyorClub"]}</div>
							<p>{oI["FeatureTextDescription"]}</p>
						</li>
					)
				}
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
	listItems:React.PropTypes.array.isRequired,
	filter:React.PropTypes.object
}

// class ContactForm extends React.Component
// {
// 	constructor(oProps)
// 	{
// 		super(oProps);
// 	}

// 	render()
// 	{
// 		return (
// 			<form>
// 				<input type="text" placeholder="Name (req)" value={this.props.contact.name}></input>
// 				<input type="text" placeholder="Email" value={this.props.contact.email}></input>
// 				<textarea placeholder="description" value={this.props.contact.description}></textarea>
// 				<button type="submit">Add Contact</button>
// 			</form>
// 		)
// 	}
// }

// ContactForm.propTypes =
// {
// 	contact:React.PropTypes.object.isRequired,
// };
//Stateless component
// const DynamicSelect = ({options}) =>
// {
// 	const handleChange = (event) =>
// 	{
// 		console.log("I want my baby back baby back baby back", event, this)
// 	}
	
// 	let aOptions = [<option value={null}>Select a Filter</option>];
// 	for(let sProp in options)
// 	{
// 		aOptions.push(<option value={sProp}>{sProp}</option>)
// 	}

// 	return(<select onChange={handleChange}>{aOptions}</select>)
// }
class DynamicSelect extends React.Component
{
	constructor(oProps)
	{
		super(oProps);

		this.handleChange = this.handleChange.bind(this)

		this.state = {value:null};
	}

	handleChange(e) {
		let sValue = e.target.value === "null" ? null : e.target.value;
		this.state.value = sValue;
		this.props.onChangeCallback(this.props.category, sValue)
	}

	render()
	{
		let aOptions = [<option value={"null"}>Select a Filter</option>];
		for(let sProp in this.props.options)
		{
			aOptions.push(<option value={sProp}>{sProp}</option>)
		}

		return (
			<select value={this.state.value} onChange={this.handleChange}>{aOptions}</select>
		)
	}
}

DynamicSelect.propTypes =
{
	options:React.PropTypes.object.isRequired,
	category:React.PropTypes.string.isRequired,
	onChangeCallback:React.PropTypes.func.isRequired
}

class FilterView extends React.Component
{
	constructor(oProps)
	{
		super(oProps);
	}

	render()
	{
		let aSelects = [];
		for(let sProp in this.props.filters)
		{
			aSelects.push(<DynamicSelect onChangeCallback={this.props.onChangeCallback} category={sProp} options={this.props.filters[sProp]}/>)
		}
		return (
			<div className={this.props.cssName}>{aSelects}</div>
		);
	}
}
FilterView.propTypes =
{
	cssName:React.PropTypes.string.isRequired,
	filters:React.PropTypes.object.isRequired,
	onChangeCallback:React.PropTypes.func.isRequired
}

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
				<Main listItems={this.props.eventData} filter={this.props.filter}/>
			</div>
		);
	}
}

MainView.propTypes =
{
	eventData:React.PropTypes.array.isRequired,
	cssName:React.PropTypes.string.isRequired,
	filter:React.PropTypes.object
}

let oReq = new XMLHttpRequest();
oReq.onload = (e)=>{
	let oData = JSON.parse(e.currentTarget.responseText);
	let aEvents = oData["Events Main"]
	let oStuff = {
		EventName:{},
		EventStartDate:{},
		EventStartTime:{},
		EventCategory:{}
	};
	let oGather = [
		{id:"name", field:"EventName"},
		{id:"date", field:"EventStartDate"},
		{id:"start", field:"EventStartTime"},
		{id:"type", field:"EventCategory"},
	]
	for (let oEvent of aEvents)
	{
				
		for(let sProp in oEvent)
		{
			const sNew = sProp.replace(new RegExp(" ", 'g'), "").replace(/[\n\r]/g, '');
			oEvent[sNew] = oEvent[sProp]
			delete oEvent[sProp];
			if(oStuff[sNew] !== null && oStuff[sNew] !== undefined && oStuff[sNew][oEvent[sNew]] == null)
			{
				oStuff[sNew][oEvent[sNew]] = true;
			}
		}
	}
	console.log("oStuff", oStuff)
	console.log("oData", oData)

	let fRenderMain = function (sCategory, sValue){
		console.log("I are render", sCategory, sValue)
		render((
			<MainView eventData={oData["Events Main"]} filter={{category:sCategory, value:sValue}} cssName="got-monkey"/>

		), document.getElementById('main'));
	}

	render((
		<FilterView filters={oStuff} onChangeCallback={fRenderMain} cssName="got-monkey"/>

	), document.getElementById('filter-area'));
	fRenderMain();
};
oReq.open("get", "origins.json", true);
oReq.send();

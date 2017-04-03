import React from "react";
import {render} from 'react-dom';

let oReq = new XMLHttpRequest();
oReq.onload = (e)=>{
	let oData = JSON.parse(e.currentTarget.responseText);
	let aEvents = oData["Events Main"]
	let oStuff = {
		EventName:{},
		EventNameArray:[],
		EventStartDate:{},
		EventStartTime:{},
		EventCategory:{}
	};

	for (let oEvent of aEvents)
	{
				
		for(let sProp in oEvent)
		{
			//Turning presentation data in filterable categorical data with useable field names. Removing spaces and carriage returns. 
			const sNew = sProp.replace(new RegExp(" ", 'g'), "").replace(/[\n\r]/g, '');

			//Copy data to the new scrubbed attribute name, delete the previous.
			oEvent[sNew] = oEvent[sProp];
			delete oEvent[sProp];

			//Build some filter objects. Magic string to get and sort event names.
			if(oStuff[sNew] !== null && oStuff[sNew] !== undefined && oStuff[sNew][oEvent[sNew]] == null)
			{
				oStuff[sNew][oEvent[sNew]] = true;

				if (sNew == "EventName")
				{
					oStuff.EventNameArray.push(oEvent[sNew])
				}
			}
		}
	}

	//So hacky.
	oStuff.EventNameArray = oStuff.EventNameArray.sort();
	oStuff.EventName = {};

	for (let sEN of oStuff.EventNameArray)
	{
		oStuff.EventName[sEN] = true;
	}

	delete oStuff.EventNameArray;
	let bCurrentCompact = false;
	let sCurrentCategory = null;
	let sCurrentValue = null;

	let fCompact = function (bCompact){
		bCurrentCompact = bCompact;
		fRenderEvents(sCurrentCategory, sCurrentValue)
	}

	let fRenderEvents = function (sCategory, sValue){
		sCurrentCategory = sCategory;
		sCurrentValue = sValue;
		render((<EventList events={oData["Events Main"]} filter={{category:sCategory, value:sValue}} compactView={bCurrentCompact}/>), document.getElementById('main'));
	}

	render((<FilterView filters={oStuff} onChangeCallback={fRenderEvents} onCompactUpdate={fCompact} cssName="got-monkey"/>), document.getElementById('filter-area'));
	fRenderEvents();
};
oReq.open("get", "origins.json", true);
oReq.send();

//React Stateless Functional Component
const EventList = ({events, filter, compactView}) => {
	let sCategory = filter !== null && filter.category !== null ? filter.category : null;
	let sValue = filter !== null && filter.value !== null ? filter.value : null;
	
	var aItems = events.map(
		function(oI)
		{
			let bAllow = true;
			if(sCategory !== null && sValue !== null)
			{
				bAllow = oI[sCategory] === sValue;
			}

			if (bAllow)
			{
				if(compactView)
				{
					return(
						<li className="list-item">
							<span><b>{oI["EventName"]}</b> | <span>{oI["EventStartDate"]} : {oI["EventStartTime"]} ({oI["EventDuration"]} hours)</span></span>
						</li>
					)
				}
				else{
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
		}
	)

	return (<ul className="items">{aItems}</ul>);
};

EventList.propTypes =
{
	events:React.PropTypes.array.isRequired,
	filter:React.PropTypes.object,
	compactView:React.PropTypes.bool
}

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
		this.handleCompact = this.handleCompact.bind(this)
	}

	handleCompact(e) {
		this.props.onCompactUpdate(e.target.checked);
	}

	render()
	{
		let aSelects = [];
		for(let sProp in this.props.filters)
		{
			aSelects.push(<DynamicSelect onChangeCallback={this.props.onChangeCallback} category={sProp} options={this.props.filters[sProp]}/>)
		}
		return (
			<div className={this.props.cssName}>{aSelects}<input type="checkBox" onChange={this.handleCompact}></input></div>
		);
	}
}
FilterView.propTypes =
{
	cssName:React.PropTypes.string.isRequired,
	filters:React.PropTypes.object.isRequired,
	onChangeCallback:React.PropTypes.func.isRequired,
	onCompactUpdate:React.PropTypes.func.isRequired
}

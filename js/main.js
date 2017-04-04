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

	let fCompact = function (bCompact, oFilters){
		bCurrentCompact = bCompact;
		fRenderEvents(oFilters)
	}

	let fRenderEvents = function (oFilters){
		render((<EventList events={oData["Events Main"]} filter={oFilters} compactView={bCurrentCompact}/>), document.getElementById('main'));
	}

	render((<FilterView filters={oStuff} onChangeCallback={fRenderEvents} onCompactUpdate={fCompact} cssName="got-monkey"/>), document.getElementById('filter-area'));
	fRenderEvents();
};
oReq.open("get", "origins.json", true);
oReq.send();

//React Stateless Functional Component
const EventList = ({events, filter, compactView}) => {
	if (filter === null || filter === undefined)
	{
		filter = {};
	}
	let oFilter = filter;
	if (filter.category !== null)
	{
		let sCategory = filter !== null && filter.category !== null ? filter.category : null;
		let sValue = filter !== null && filter.value !== null ? filter.value : null;
		let oTemp = {};
		oTemp[sCategory] = sValue;
		filter = oTemp;
	}
	
	var aItems = events.map(
		(oI)=>
		{
			let nFilters = 0;
			let nPass = 0;
			let bAllow = true;

			for(let sCat in oFilter)
			{
				if (sCat !== null && sCat !== undefined && oFilter[sCat] !== null && oFilter[sCat] !== undefined)
				{
					nFilters++;
					if (oI[sCat] === oFilter[sCat])
					{
						nPass++;
					}
				}
			}

			if(nFilters > 0)
			{
				if (nPass < nFilters)
				{
					bAllow = false;
				}
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

class FilterView extends React.Component
{
	constructor(oProps)
	{
		super(oProps);

		this.state = {};
		for(let sProp in this.props.filters)
		{
			this.state[sProp] = null;
		}

		this.handleCompact = this.handleCompact.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
		this.clearFilter = this.clearFilter.bind(this);

	}

	handleCompact(e) {
		this.props.onCompactUpdate(e.target.checked, this.state);
	}

	handleFilter(sCategory, sValue) {
		this.state[sCategory] = sValue
		this.props.onChangeCallback(this.state);
	}
	
	clearFilter() {
		console.log("Clear the filters")
		this.state = {}
		this.props.onChangeCallback(this.state);
	}

	render()
	{
		let aSelects = [];
		for(let sProp in this.props.filters)
		{
			aSelects.push(<DynamicSelect onChangeCallback={this.handleFilter} category={sProp} options={this.props.filters[sProp]}/>)
		}
		return (
			<div className={this.props.cssName}>{aSelects}<input type="checkBox" onChange={this.handleCompact}></input><div onClick={this.clearFilter} className={this.props.cssName}>Clear</div></div>
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
		this.setState({value:sValue});
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

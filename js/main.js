import React from "react";
import {render} from 'react-dom';
import 'style!../sass/origins.scss';

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

	let oDateFix =
	{
		"Wed. 6/14":"6/14/2017",
		"Thu. 6/15":"6/15/2017",
		"Thurs. 6/15":"6/15/2017",
		"Fri. 6/16":"6/16/2017",
		"Sat. 6/17":"6/17/2017",
		"Sun. 6/18":"6/18/2017"
	}

	for (let oEvent of aEvents)
	{
		for(let sProp in oEvent)
		{
			//Turning presentation data in filterable categorical data with useable field names. Removing spaces and carriage returns. 
			const sNew = sProp.replace(new RegExp(" ", 'g'), "").replace(/[\n\r]/g, '');

			//Seriously, this data, so bad. Removing leading whitespace.
			if (oEvent[sProp].substr(0,1) === " ")
			{
				oEvent[sProp] = oEvent[sProp].replace(" ", "");
			}

			if (sNew == "EventStartDate")
			{
				const sDate = oEvent[sProp];
				if(oDateFix[sDate])
				{
					oEvent[sProp] = oDateFix[sDate]
				}
				else if(sDate.indexOf("/17") === 4)
				{
					oEvent[sProp] = sDate.replace("/17", "/2017");
				}
				else if(sDate.indexOf("/17/17") === 1)
				{
					oEvent[sProp] = sDate.replace("/17/17", "/17/2017");
				}
			}

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
	let nLimit = 1000;

	let fCompact = function (bCompact, oFilters){
		bCurrentCompact = bCompact;
		fRenderEvents(oFilters)
	}
	
	let fLimit = function (bAll, oFilters){
		nLimit = bAll ? 0 : 1000;
		fRenderEvents(oFilters)
	}

	let fRenderFilters = function (){
		render((<FilterView filters={oStuff} onChangeCallback={fRenderEvents} onLimit={fLimit} onCompactUpdate={fCompact} onClear={fClear} cssName="got-monkey"/>), document.getElementById('filter-area'));
	}

	let fRenderEvents = function (oFilters){
		render((<EventList events={oData["Events Main"]} filter={oFilters} compactView={bCurrentCompact} limit={nLimit}/>), document.getElementById('main'));
	}

	let fClear = function (){
		bCurrentCompact = false;
		fRenderFilters();
		fRenderEvents();
	}

	fRenderFilters();
	fRenderEvents();
};
oReq.open("get", "origins.json", true);
oReq.send();

//React Stateless Functional Component
const EventList = ({events, filter, compactView, limit}) => {
	if (filter === null || filter === undefined)
	{
		filter = {};
	}
	limit = limit !== null && limit !== undefined ? limit : 0;
	let oFilter = filter;
	let nVisible = 0;
	if (filter.category !== null)
	{
		let sCategory = filter !== null && filter.category !== null ? filter.category : null;
		let sValue = filter !== null && filter.value !== null ? filter.value : null;
		let oTemp = {};
		oTemp[sCategory] = sValue;
		filter = oTemp;
	}
	
	var aItems = events.map(
		(oI, nI)=>
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
				nVisible++;
				if(compactView)
				{
					return(
						<li className="list-item compact-mode" key={nI}>
							<div className="event-title"><b>{oI["EventName"]}</b></div>
							<span className="where-when">{oI["EventStartDate"]} @ {oI["EventStartTime"]} ({oI["EventDuration"]} hours)</span>
						</li>
					)
				}
				else{
					return(
						<li className="list-item" key={nI}>
							<div className="event-title"><b>{oI["EventName"]}</b></div>
							<div className="row where-when">{oI["EventStartDate"]} @ {oI["EventStartTime"]}
							</div>
							<span className="duration"><b>Duration:</b> {oI["EventDuration"]}</span>
							<div className="row">
								<span className="col-3"><b>Category:</b> {oI["EventCategory"]}</span>
								<span className="col-3"><b>Players:</b> {oI["MaximumPlayers"]}</span>
								<span className="col-3"><b>Complexity:</b> {oI["GameComplexity"]}</span>
							</div>
							<div className="row">
								<span className="col-3"><b>Manufacturer:</b> {oI["GameManufacturer"]}</span>
								<span className="col-3"><b>System:</b> {oI["GameSystem"]}</span>
								<span className="col-3"><b>Host:</b> {oI["HostingCompanyorClub"]}</span>
							</div>
							<div className="description-heading"><b>Description</b></div>
							<p className="description">{oI["FeatureTextDescription"]}</p>
						</li>
					)	
				}
			}
			else {return null};
		}
	)

	if (limit > 0 && nVisible > limit)
	{
		aItems = aItems.slice(0, limit);
	}
	return (<div><span>{nVisible} Items.</span><ul className="items">{aItems}</ul></div>);
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

		this.sKey = "a";

		this.handleCompact = this.handleCompact.bind(this);
		this.handleLimit = this.handleLimit.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
		this.clearFilter = this.clearFilter.bind(this);

	}

	handleCompact(e) {
		this.props.onCompactUpdate(e.target.checked, this.state);
	}
	
	handleLimit(e) {
		this.props.onLimit(e.target.checked, this.state);
	}

	handleFilter(sCategory, sValue) {
		this.state[sCategory] = sValue
		this.props.onChangeCallback(this.state);
	}
	
	clearFilter() {
		for(let sProp in this.props.filters)
		{
			this.state[sProp] = null;
		}
		//We create a different key to force React to render our filters from scratch.
		this.sKey = this.sKey === "a" ? "b" : "a";
		this.props.onClear();
	}

	render()
	{
		let aSelects = [];
		let nKey = 0;
		for(let sProp in this.props.filters)
		{
			aSelects.push(<DynamicSelect onChangeCallback={this.handleFilter} category={sProp} options={this.props.filters[sProp]} value={this.state[sProp]} key={this.sKey + nKey}/>)
			nKey++;
		}
		return (
			<div className={this.props.cssName}>{aSelects}<br/><input id="compactMode" name="compactMode" type="checkBox" onChange={this.handleCompact}></input><label htmlFor="compactMode">View in Compact Mode</label><input id="limited" name="limited" type="checkBox" onChange={this.handleLimit}></input><label htmlFor="limited">Show All</label><div onClick={this.clearFilter} className={this.props.cssName}>Clear</div></div>
		);
	}
}
FilterView.propTypes =
{
	cssName:React.PropTypes.string.isRequired,
	filters:React.PropTypes.object.isRequired,
	onChangeCallback:React.PropTypes.func.isRequired,
	onCompactUpdate:React.PropTypes.func.isRequired,
	onLimit:React.PropTypes.func.isRequired,
	onClear:React.PropTypes.func.isRequired
}

class DynamicSelect extends React.Component
{
	constructor(oProps)
	{
		super(oProps);

		this.handleChange = this.handleChange.bind(this)

		this.state = {value:undefined};
	}

	handleChange(e) {
		let sValue = e.target.value === "undefined" ? undefined : e.target.value;
		this.state.value = sValue;
		this.props.onChangeCallback(this.props.category, sValue)
	}

	render()
	{
		let aOptions = [<option value={`undefined`} key={0}>Select a Filter</option>];
		let nKey = 1;
		for(let sProp in this.props.options)
		{
			aOptions.push(<option value={sProp} key={nKey}>{sProp}</option>)
			nKey++;
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
	onChangeCallback:React.PropTypes.func.isRequired,
	value:React.PropTypes.string.isRequired
}

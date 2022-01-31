import React from 'react';
import axios from 'axios';
import ReactCountryFlag from 'react-country-flag';
import * as d3 from 'd3';
import * as d3time from 'd3-time';
import { formatDate } from '../format-date';

export class VTWidget2 extends React.Component {
    constructor(){
        super();
        this.state = {
            country_data: [],
            country_data_filtered: [],
            date: undefined,
            range: 0,
            vaccines_in_range: undefined,
            loading: true,
            start_date: undefined,
            end_date: undefined,
            total_vaccinations: 0
        }
    }

    componentDidMount() {

        axios.get(`https://api.mediahack.co.za/adh/vaccine-tracker/vaccinations-by-country.php?cc=${this.props.country_iso_3}`)
        .then((response) => {

            this.setState({ country_data: response.data });

            let date = new Date(response.data[response.data.length - 1].date_of_report);
            this.setState({ date: formatDate(date)});

            this.changeRange(14);

        })
    }

    componentDidUpdate() {


    }

    changeRange(range) {

        if(this.state.range != range) {

            this.setState({ range: range });
            this.setState({ loading: true });
            this.setState({ country_data_filtered: this.state.country_data.slice(-Math.abs(range)) });
                
            setTimeout(() => {
                
                let total_vaccinations = this.state.country_data_filtered.reduce(
                    (accumVariable, curValue) => accumVariable + parseInt(curValue.daily_total)
                    , this.state.total_vaccinations
                )

                this.setState({ total_vaccinations: total_vaccinations });

                let start_date = new Date(this.state.country_data_filtered[0].date_of_report);
                let end_date = new Date(this.state.country_data_filtered[this.state.country_data_filtered.length - 1].date_of_report);

                this.setState({ start_date: formatDate(start_date) });
                this.setState({ end_date: formatDate(end_date) });

                this.setState({ loading: false });
                this.drawChart();
            }, 1000)
        }


    }

    drawChart() {

        let chart_settings = {
            width: 280,
            height: 150,
            xOffset: 30
        }

        let tickFormat = function (d) {
            var limits = [1000000000000000, 1000000000000, 1000000000, 1000000, 1000];
            var shorteners = ['Q','T','B','M','K'];
            for(var i in limits) {
              if(d > limits[i]) {
                return (d/limits[i]).toFixed() + shorteners[i];
              }
            }
            return d;
        };


        const svg = d3.select('svg')
            .attr('width', chart_settings.width)
            .attr('height', chart_settings.height)
            .attr('transform', 'translate(10,0)');

        let yScale = d3.scaleLinear()
            .domain([d3.max(this.state.country_data_filtered, (d) => d.daily_total ), 0])
            .range([0, chart_settings.height - 10]);
        
        let xScale = d3.scaleBand()
            .domain(this.state.country_data_filtered.map((d) => d.date_of_report))
            .range([0, chart_settings.width - chart_settings.xOffset - 10])
            .padding(0.2);
    
        let yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(tickFormat);

        let xAxis = d3.axisBottom(xScale)
            .tickSizeOuter(0)
        
        svg.append('g')
            .attr('transform','translate(30,0)')
            .attr('class','yAxis')
            .call(yAxis)

        svg.append('g')
            .attr('transform','translate(' + (chart_settings.xOffset) + ',' + (chart_settings.height - 10) +')')
            .attr('class','xAxis')
            .call(xAxis);

        svg.selectAll("line.horizontalGrid")
            .data(yScale.ticks(5)).enter()
            .append("line")
                .attr('class', 'horizontalGrid')
                .attr('x1', chart_settings.xOffset)
                .attr('x2', chart_settings.width - 10)
                .attr('y1', (d) => yScale(d))
                .attr('y2', (d) => yScale(d))
                .attr('fill', 'none')
                .attr('shape-rendering', 'crispEdges')
                .attr('stroke', '#DAE0EA')
                .attr('stroke-width', '1px');

        svg.append('g')
            .attr('transform', 'translate(' + (chart_settings.xOffset) + ',0)')
            .selectAll('rect')
            .data(this.state.country_data_filtered)
            .enter()
            .append('rect')
                .attr('x', (d,i) => xScale(d.date_of_report))
                .attr('y', (d,i) => chart_settings.height - 10 )
                .attr('width', xScale.bandwidth())
                .transition().duration(500)
                .attr('y', (d,i) => chart_settings.height - yScale(parseInt(d.daily_total)) - 10 )
                .attr('fill','#CBD5E1')
                .attr('height',(d,i) => { 
                    let height = yScale(parseInt(d.daily_total)) > -1 ? yScale(parseInt(d.daily_total)) : 0;
                    return height;
                } );
        
    }

    

    

    render() {
        return (
            
            <div id="vt2">
                <section className={this.props.headerBg + '  text-center pt-0 pb-3 leading-none relative'}>
                    <div className="rounded-full border-2 border-white w-12 h-12 -translate-y-2/4 -translate-x-2/4 mt-2 overflow-hidden absolute left-1/2">
                        <ReactCountryFlag svg countryCode={this.props.country_iso_2} style={{fontSize: '3.8em', height: 'unset', maxWidth: 'unset'}} className="absolute inset-1/2 -translate-y-2/4  -translate-x-2/4"/>
                    </div>
                    <h2 className={this.state.accent_text + ' uppercase font-bold text-md pt-9 leading-none mb-0'}>{this.props.country_name}</h2>
                    <span className="text-gray-600 uppercase text-[10px] font-bold leading-none mt-0 pt-0">
                        {this.state.date}
                    </span>
                </section>
                <section className={this.props.bg + ' text-center py-2'}>
                    <div className="my-4">
                        <h1 className={this.props.accentText + ' font-bold text-2xl leading-none py-0'}>{d3.format(",")(this.state.total_vaccinations)}</h1>
                        <span className="text-gray-600 font-bold text-xs">VACCINES IN THE LAST <span className="text-lg">{this.state.range}</span> DAYS</span>
                    </div>

                    { this.state.loading == false ? 
                        <>
                            <div className="text-gray-600 text-xs mb-5">

                                { this.state.start_date != undefined ? 
                                    
                                    this.state.start_date + ' - ' + this.state.end_date
                                
                                : '&nbsp;' }

                            </div>

                            <svg id="chart"/>
                        </>
                    :
                        <div className="py-10 font-bold" style={{height: '150px'}}>Loading...</div>
                    }

                    <div className="range_buttons mt-5 mb-3">
                        <button className={ (this.state.range == 14 ? 'bg-slate-400' : 'bg-slate-200') + ' px-3 py-1 text-white text-xs rounded-l-lg' } onClick={() => { this.changeRange(14) }}>14 DAYS</button>
                        <button className={ (this.state.range == 30 ? 'bg-slate-400' : 'bg-slate-200') + ' px-3 py-1 text-white text-xs rounded-r-lg' } onClick={() => { this.changeRange(30) }}>30 DAYS</button>
                    </div>
                </section>
            </div>
            
        )
    }

}

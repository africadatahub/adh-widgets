import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import ReactCountryFlag from 'react-country-flag';
import * as d3 from 'd3';
import './VTWidget1.css';

export class VTWidget1 extends React.Component {
    constructor(){
        super();
        this.state = {
            vaccines_received: 0,
            vaccine_sources: [],
            country_data: {},
            date: undefined
        }
    }

    componentDidMount() {

        

        const urlParams = new URLSearchParams(window.location.search)

        axios.get(`https://api.mediahack.co.za/adh/vaccine-tracker/vaccinations-by-country.php?cc=${this.props.country_iso_3}`)
        .then((response) => {
            this.setState({ country_data: response.data[response.data.length - 1] });
            let date = new Date(response.data[response.data.length - 1].date_of_report);
            
            this.setState({ date: this.formatDate(date)});
        })

        // axios.get(`https://api.mediahack.co.za/adh/vaccine-tracker/vaccinations-types.php`)
        // .then((response) => {
        // })

        axios.get(`https://api.mediahack.co.za/adh/vaccine-tracker/vaccinations-sources.php`)
        .then((response) => {
            let vaccine_sources = response.data.find(country => country.iso_code === this.props.country_iso_3);

            let vaccines_received = parseInt(vaccine_sources.covax) + parseInt(vaccine_sources.bought) + parseInt(vaccine_sources.donated);

            let vaccine_sources_trans =  [
                {
                    source: 'covax',
                    value: parseInt(vaccine_sources.covax),
                    percent: parseInt(vaccine_sources.covax) / vaccines_received * 100,
                    color: '#A3DAEC'
                },
                {
                    source: 'bought',
                    value: parseInt(vaccine_sources.bought),
                    percent: parseInt(vaccine_sources.bought) / vaccines_received * 100,
                    color: '#62DBBE'
                },
                {
                    source: 'donated',
                    value: parseInt(vaccine_sources.donated),
                    percent: parseInt(vaccine_sources.donated) / vaccines_received * 100,
                    color: '#82A7C9'

                }

            ]

            this.setState({ vaccines_received: vaccines_received });
            this.setState({ vaccine_sources: vaccine_sources_trans });
            
            this.drawChart();
        })



    }

    componentDidUpdate() {
    }

    drawChart() {
        const svg = d3.select('svg')
            .attr('width', '300')
            .attr('height', '100')
            .attr('transform', 'translate(0,0)');

        let yScale = d3.scaleBand()
            .domain(['covax','bought','donated'])
            .range([0,90])
            .padding(.2);
        
        let xScale = d3.scaleLinear()
            .domain([0,100])
            .range([0,200]);
    
        let yAxis = d3.axisLeft(yScale);
        
        svg.append('g')
            .attr('transform','translate(90,0)')
            .call(yAxis)

        svg.append('g')
            .attr('transform', 'translate(90,0)')
            .selectAll('rect')
            .data(this.state.vaccine_sources)
            .enter()
            .append('rect')
                .attr('x', 0)
                .attr('y', (d,i) => yScale(d.source))
                .attr('height',yScale.bandwidth())
                .attr('fill',(d,i) => d.color)
                .attr('width', 0)
                .transition().duration(1000).delay((d,i) => i * 500)
                .attr('width', (d,i) => xScale(d.percent));

                
        svg.append('g')
            .attr('class','labels')
            .attr('transform', 'translate(90,0)')
            .selectAll('text')
            .data(this.state.vaccine_sources)
            .enter()
            .append('text')
                .attr('x', 5)
                .attr('y', (d,i) => yScale(d.source) + yScale.bandwidth()/2 + 5)
                .text((d,i) => d3.format(".2f")(d.percent) + '%')
                .attr('fill', '#333')
                .attr('opacity',0)
                .transition().duration(1000).delay((d,i) => i * 500)
                .attr('opacity',1)
    }

    formatDate(date) {
        const dob = new Date(date);
      
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June', 'July',
           'August', 'September', 'October', 'November', 'December'
        ];
      
        const day = dob.getDate();
        const monthIndex = dob.getMonth();
        const year = dob.getFullYear();

        return `${day} ${monthNames[monthIndex]} ${year}`;
    }

    render() {
        return (
            <>
                
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
                        <h1 className={this.props.accentText + ' font-bold text-2xl leading-none py-0'}>{this.state.vaccines_received != undefined ? d3.format(",")(this.state.vaccines_received) : ''}</h1>
                        <span className="text-gray-600 font-bold text-xs">TOTAL VACCINES RECEIVED</span>
                    </div>

                    <svg id="chart"/>

                    <div className="my-4">
                        <h1 className={this.props.accentText + ' font-bold text-2xl leading-none py-0'}>{this.state.country_data.total_vaccine_doses_to_date != undefined ? d3.format(",")(this.state.country_data.total_vaccine_doses_to_date) : ''}</h1>
                        <span className="text-gray-600 font-bold text-xs">VACCINES ADMINISTERED</span>
                    </div>
                </section>     
            </>
        )
    }

}

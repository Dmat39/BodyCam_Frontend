
import Chart from 'react-apexcharts';

const BarChart = ({ title, series, categories }) => {

    const options = {
        chart: { id: 'bar-chart', toolbar: { show: false, } },
        xaxis: { categories: ['Perú', 'México', 'Chile', 'Colombia'] },
        dataLabels: { enabled: false },
        colors: ['#FEB019','#008FFB', '#00E396'],
        stroke: { curve: 'smooth', width: 2 },
        title: { text: title, align: 'center' },
        legend: { position: 'top' },
    };

    series = [
        { name: 'Burgers', data: [120, 200, 90, 150] },
        { name: 'Tacos', data: [75, 150, 60, 110] },
        //{ name: 'Burrito', data: [80, 170, 50, 50] },
    ];

    return (
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <Chart options={options} series={series} type="bar" height={350} width={300} />
        </div>
    );
}

export default BarChart;

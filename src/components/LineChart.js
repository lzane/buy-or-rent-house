import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'
import * as echarts from './ec-canvas/echarts'


function setChartData(chart, data) {
  let option = {
    color: ['#B1D2FF', '#F7CBF2'],
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data:['买房','租房']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true,
      },
      axisLabel: {
        color: '#000'
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#D7D8DA'],
          type: 'dashed'
        }
      }
    }],
    yAxis: {
      type: 'value',
      axisLine: {
        show: true
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#000'
      },
      splitLine: {
        show: false,
      }
    },
    series: []
  }
  if (data && data.dimensions && data.measures) {
    option.xAxis[0].data = data.dimensions.data
    option.series = data.measures.map(item => {
      return {
        ...item,
        type: 'line',
        smooth: true
      }
    })
  }
  chart.setOption(option)
}

export default class LineChart extends Component {
  config = {
    usingComponents: {
      'ec-canvas': './ec-canvas/ec-canvas'
    }
  }

  constructor(props) {
    super(props)
  }

  state = {
    ec: {
      lazyLoad: true
    }
  }


  refresh(data) {
    const { height } = this.props
    const rect = this.Chart.parentNode.getBoundingClientRect()
    const chart = echarts.init(this.Chart, null, {
    width: rect.width,
    height: height
    });
    setChartData(chart, data);
    return chart;

    // this.Chart.init((canvas, width, height) => {
    //   const chart = echarts.init(canvas, null, {
    //     width: width,
    //     height: height
    //   });
    //   setChartData(chart, data);
    //   return chart;
    // })
  }

  refChart = (node) => {
    this.Chart = node
  }

  render() {
    return (
      <ec-canvas ref={this.refChart} canvas-id='mychart-area' ec={this.state.ec} />
    )
  }
}

import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'
import * as echarts from './ec-canvas/echarts'

function setChartData(chart, data) {
  let option = {
    color: ['#f44336', '#6392e5'],
    tooltip: {
      trigger: 'axis',
      position: [10, 10],
    },
    legend: {
      data: ['买房', '租房'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '5.5%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      nameLocation: 'end',
      nameGap: 5,
      name: '年',
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
      nameLocation: 'end',
      nameGap: 10,
      name: '净资产',
      scale: true,
      axisLine: {
        show: true
      },
      axisTick: {
        show: true
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
  };

  constructor(props) {
    super(props)
  }

  state = {
    ec: {
      lazyLoad: true
    }
  };

  refresh(data) {
    if(Taro.getEnv()===Taro.ENV_TYPE.WEB){
      const {height} = this.props
      const rect = this.Chart.parentNode.getBoundingClientRect()
      const chart = echarts.init(this.Chart, null, {
        width: rect.width,
        height: height
      });
      setChartData(chart, data);
      return chart;
    }

    this.Chart.init((canvas, width, height) => {
      console.log(canvas,width,height);
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      setChartData(chart, data);
      return chart;
    })
  }

  refChart = (node) => {
    this.Chart = node
  };

  render() {
    return (
      <ec-canvas
        ref={this.refChart}
        canvas-id='mychart-area'
        ec={this.state.ec}
      />
    )
  }
}

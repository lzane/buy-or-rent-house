import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {AtAccordion, AtInput, AtInputNumber, AtSlider} from "taro-ui";
import {Finance} from 'financejs'
import fp from 'lodash/fp'

import LineChart from "../../components/LineChart";
import 'taro-ui/dist/style/index.scss' // 全局引入一次即可
import './index.scss'

let finance = new Finance();

/**
 * @return {string}
 */
function FV(rate, nper, pmt, pv, type) {
  if (!type) type = 0;

  var pow = Math.pow(1 + rate, nper);
  var fv = 0;

  if (rate) {
    fv = (pmt * (1 + rate * type) * (1 - pow) / rate) - pv * pow;
  } else {
    fv = -1 * (pv + pmt * nper);
  }

  return fv;
}

function getNetAssetBuyingHouse(months, housePrice, houseIncreaseRate, loan, loanRate, pmt) {
  const loanAfterMonths = FV(loanRate / 100 / 12, months, pmt, loan);
  const housePriceAfterMonths = FV(houseIncreaseRate / 100 / 12, months, 0, -housePrice);

  return housePriceAfterMonths + loanAfterMonths;
}

function getNetAssetRentingHouse(months, rentPrice, rentIncreaseRate, pmt, principle, financeCost) {
  if (months === 0) {
    return principle;
  }
  let acc = principle;
  for (let i = 1; i <= months; i++) {
    let currentRentPrice = FV(rentIncreaseRate / 100 / 12, i, 0, -rentPrice);
    let realPmt = pmt + currentRentPrice;
    acc = FV(financeCost / 100 / 12, 1, realPmt, -acc);
  }
  return acc;
}


export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  };

  constructor() {
    super(...arguments);
    this.state = {
      housePrice: 400,
      loan: 251,
      loanYears: 30,
      loanRate: 5.15,
      downPayment: 160,
      houseIncreaseRate: 3,
      rentPrice: 0.6,
      rentIncreaseRate: 5,
      financeCost: 5,
      open: true,
    }
  }


  handleChange(item, value) {
    console.log('item', value);
    if (value === '-999' || value === -999) {
      value = 0;
    }
    console.log('item', value);

    this.setState({
      [item]: Number(value)
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }

  handleSliderChange(item, {value}) {
    this.setState({
      [item]: Number(value)
    });
    return value
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.throttleUpdateData();
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  componentDidUpdate(prevProps, prevState, prevContext) {
    this.throttleUpdateData();
  }

  onShareAppMessage(res) {
    return {
      title: '买不买房',
    }
  }

  refLineChart = (node) => {
    this.lineChart = node
  };

  throttleUpdateData = fp.debounce(500)(this.updateData);

  updateData() {
    const {loanRate, loanYears, loan, houseIncreaseRate, housePrice, rentPrice, rentIncreaseRate, downPayment, financeCost} = this.state;
    const pmt = finance.PMT(loanRate / 100 / 12, loanYears * 12, loan);
    const years = loanYears;
    this.assetBuyingHouseArr = fp.map((year) => getNetAssetBuyingHouse(year * 12, housePrice, houseIncreaseRate, loan, loanRate, pmt))(fp.range(0, years + 1))
    this.assetRentingHouseArr = fp.map((year) => getNetAssetRentingHouse(year * 12, rentPrice, rentIncreaseRate, pmt, downPayment, financeCost))(fp.range(0, years + 1))

    let data = {
      dimensions: {
        name: '年数',
        data: fp.range(0, years + 1)
      },
      measures: [{
        name: '买房',
        data: this.assetBuyingHouseArr,
      }, {
        name: '租房',
        data: this.assetRentingHouseArr,
      }]
    };

    this.lineChart.refresh(data);
  }

  render() {
    return (
      <View className='index'>
        <View style={{width: '100%', height: '250px'}}>
          <LineChart ref={this.refLineChart} height='250px'/>
        </View>

        <View style={{marginTop: '10px'}}>
          <View style={{lineHeight: '15px', marginLeft: '15px'}}><Text
            style={{fontSize: '0.7rem'}}>房价上涨/下跌比率(%)</Text></View>
          <AtSlider value={this.state.houseIncreaseRate} step={1} min={-30} max={30} showValue
                    onChange={this.handleSliderChange.bind(this, 'houseIncreaseRate')}/>

          <View style={{lineHeight: '15px', marginLeft: '15px'}}><Text
            style={{fontSize: '0.7rem'}}>房租上涨/下跌比率(%)</Text></View>
          <AtSlider value={this.state.rentIncreaseRate} step={1} min={-30} max={30} showValue
                    onChange={this.handleSliderChange.bind(this, 'rentIncreaseRate')}/>

          <View style={{lineHeight: '15px', marginLeft: '15px'}}><Text
            style={{fontSize: '0.7rem'}}>投资年化收益率(%)</Text></View>
          <AtSlider value={this.state.financeCost} step={1} min={-30} max={30} showValue
                    onChange={this.handleSliderChange.bind(this, 'financeCost')}/>
        </View>


        <View className='at-row at-row__justify--around' style={{textAlign: "center", marginTop: '10px'}}>
          <View className='at-col at-col-4 at-col--wrap'>
            <AtInputNumber
              type='digit'
              min={-999}
              max={999}
              step={1}
              value={this.state.houseIncreaseRate}
              onChange={this.handleChange.bind(this, 'houseIncreaseRate')}
            />
            <View style={{lineHeight: '15px'}}><Text style={{fontSize: '0.7rem'}}>房价上涨比率(%)</Text></View>
          </View>
          <View className='at-col at-col-4 at-col--wrap'>
            <AtInputNumber
              type='digit'
              min={-999}
              max={999}
              step={1}
              value={this.state.rentIncreaseRate}
              onChange={this.handleChange.bind(this, 'rentIncreaseRate')}
            />
            <View style={{lineHeight: '15px'}}><Text style={{fontSize: '0.7rem'}}>房租上涨比率(%)</Text></View>
          </View>
          <View className='at-col at-col-4 at-col--wrap'>
            <AtInputNumber
              type='digit'
              min={-999}
              max={999}
              step={1}
              value={this.state.financeCost}
              onChange={this.handleChange.bind(this, 'financeCost')}
            />
            <View style={{lineHeight: '15px'}}><Text style={{fontSize: '0.7rem'}}>投资年化收益率(%)</Text></View>
          </View>
        </View>

        <AtAccordion
          open={this.state.open}
          onClick={() => {
            this.setState((state) => ({
              open: !state.open
            }))
          }}
          title='基本信息录入'
        >
          <AtInput
            name='housePrice'
            title='房屋总价'
            type='digit'
            placeholder='请输入数字'
            value={this.state.housePrice}
            onChange={this.handleChange.bind(this, 'housePrice')}
          />
          <AtInput
            name='downPayment'
            title='首付+额外支出'
            type='digit'
            placeholder='包含税费，中介费等。请输入数字'
            value={this.state.downPayment}
            onChange={this.handleChange.bind(this, 'downPayment')}
          >
          </AtInput>
          <AtInput
            name='housePrice'
            title='贷款总额'
            type='digit'
            placeholder='请输入数字'
            value={this.state.loan}
            onChange={this.handleChange.bind(this, 'loan')}
          />
          <AtInput
            name='loanRate'
            title='房贷利率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.loanRate}
            onChange={this.handleChange.bind(this, 'loanRate')}
          >
            <Text> % </Text>
          </AtInput>
          <AtInput
            name='loanYears'
            title='贷款年数'
            type='number'
            placeholder='请输入数字'
            value={this.state.loanYears}
            onChange={this.handleChange.bind(this, 'loanYears')}
          >
            <Text> 年 </Text>
          </AtInput>

          <AtInput
            name='rentPrice'
            title='现在房租'
            type='digit'
            placeholder='请输入数字'
            value={this.state.rentPrice}
            onChange={this.handleChange.bind(this, 'rentPrice')}
          >
          </AtInput>
        </AtAccordion>

      </View>
    )
  }
}

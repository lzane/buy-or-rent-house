import Taro, {Component} from '@tarojs/taro'
import {View, Text, Input, Picker} from '@tarojs/components'
import {AtButton, AtCard, AtDivider, AtForm, AtInput, AtInputNumber, AtTabBar} from "taro-ui";
import {Finance} from 'financejs'
import fp from 'lodash/fp'

import './index.scss'
import LineChart from "../../components/LineChart";

let finance = new Finance();
const downPaymentPercentRange = [3, 5, 7];

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
    }
  }


  handleChange(item, value) {
    this.setState({
      [item]: Number(value)
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }

  // handlePickerChange(item, value) {
  //   let result;
  //   if (item === 'downPaymentPercent') {
  //     result = downPaymentPercentRange[value.detail.value];
  //   }
  //   console.log(item, result, value, value.detail);
  //   this.setState({
  //     [item]: result
  //   });
  //
  //   return value
  // }


  componentWillMount() {
  }

  componentDidMount() {
    
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  refLineChart = (node) => this.lineChart = node;

  updateDate(){
    let data = {
      dimensions: {
        name: '年数',
        data: ['1', '2', '3', '4', '5', '6', '7','8','9','10']
      },
      measures: [{
        name: '买房',
        data: this.assetBuyingHouseArr,
      }, {
        name: '租房',
        data: this.assetRentingHouseArr,
      }]
    }
    this.lineChart.refresh(data);
  }

  render() {
    const {loanRate, loanYears, loan, houseIncreaseRate, housePrice, rentPrice, rentIncreaseRate, downPayment, financeCost} = this.state;
    const pmt = finance.PMT(loanRate / 100 / 12, loanYears * 12, loan);
    const years = 10;
    this.assetBuyingHouseArr = fp.map((year) => getNetAssetBuyingHouse(year * 12, housePrice, houseIncreaseRate, loan, loanRate, pmt))(fp.range(1, years + 11))
    this.assetRentingHouseArr = fp.map((year) => getNetAssetRentingHouse(year * 12, rentPrice, rentIncreaseRate, pmt, downPayment, financeCost))(fp.range(1, years + 1))
    setTimeout(()=>{
      this.updateDate();
    },0)
    return (
      <View className='index'>
        <AtForm>
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
          {/*<Picker*/}
          {/*  mode='selector' range={downPaymentPercentRange}*/}
          {/*  onChange={this.handlePickerChange.bind(this, 'downPaymentPercent')}*/}
          {/*  className='at-input'*/}
          {/*>*/}
          {/*  <View className='at-input__container'>*/}
          {/*    <Text className='picker at-input__title'>*/}
          {/*      首付成数*/}
          {/*    </Text>*/}
          {/*    <Text className='at-input__input'> {this.state.downPaymentPercent} </Text>*/}
          {/*    <View className='at-input__children'><Text className='taro-text'> 成 </Text>*/}
          {/*    </View>*/}
          {/*  </View>*/}
          {/*</Picker>*/}
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
            name='houseIncreaseRate'
            title='房价上涨比率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.houseIncreaseRate}
            onChange={this.handleChange.bind(this, 'houseIncreaseRate')}
          >
            <Text> % </Text>
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
          <AtInput
            name='rentIncreaseRate'
            title='房租上涨比率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.rentIncreaseRate}
            onChange={this.handleChange.bind(this, 'rentIncreaseRate')}
          >
            <Text> % </Text>
          </AtInput>
          <AtInput
            name='financeCost'
            title='投资年化收益率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.financeCost}
            onChange={this.handleChange.bind(this, 'financeCost')}
          >
            <Text> % </Text>
          </AtInput>

        </AtForm>

        <View> 每月供款: {pmt} </View>
        <LineChart ref={this.refLineChart} height='250px' />

      </View>
    )
  }
}

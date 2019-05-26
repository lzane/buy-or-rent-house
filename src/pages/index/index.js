import Taro, {Component} from '@tarojs/taro'
import {View, Text, Input, Picker} from '@tarojs/components'
import {AtButton, AtCard, AtDivider, AtForm, AtInput, AtInputNumber, AtTabBar} from "taro-ui";
import {Finance} from 'financejs'

import './index.scss'

let finance = new Finance();
const downPaymentPercentRange = [3, 5, 7];

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  };

  constructor() {
    super(...arguments);
    this.state = {
      housePrice: 400,
      downPaymentPercent: 3,
      loanYears: 30,
      loanRate: 5.15,
      extraDownPayment: 0,
      houseIncreaseRate: 5,
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

  handlePickerChange(item, value) {
    let result;
    if (item === 'downPaymentPercent') {
      result = downPaymentPercentRange[value.detail.value];
    }
    console.log(item, result, value, value.detail);
    this.setState({
      [item]: result
    });

    return value
  }


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

  render() {
    const {housePrice, downPaymentPercent, extraDownPayment, loanRate, loanYears} = this.state;
    const totalDownPay = housePrice * downPaymentPercent / 10 + extraDownPayment;
    const pmt = finance.PMT(loanRate / 100 / 12, loanYears * 12, housePrice * (1 - downPaymentPercent / 10))

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
          <Picker
            mode='selector' range={downPaymentPercentRange}
            onChange={this.handlePickerChange.bind(this, 'downPaymentPercent')}
            className='at-input'
          >
            <View className='at-input__container'>
              <Text className='picker at-input__title'>
                首付成数
              </Text>
              <Text className='at-input__input'> {this.state.downPaymentPercent} </Text>
              <View className='at-input__children'><Text className='taro-text'> 成 </Text>
              </View>
            </View>
          </Picker>
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
            name='extraDownPayment'
            title='首付额外支出'
            type='digit'
            placeholder='税费，中介费等。请输入数字'
            value={this.state.extraDownPayment}
            onChange={this.handleChange.bind(this, 'extraDownPayment')}
          >
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

        <AtButton type='primary'>点击计算</AtButton>

        <Text> 所有首付： {totalDownPay} </Text>
        <Text> 每月供款: {pmt} </Text>
      </View>
    )
  }
}

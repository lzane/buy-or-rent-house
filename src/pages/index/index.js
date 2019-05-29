import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtAccordion, AtInput, AtSlider, AtNoticebar, AtButton, AtMessage, AtTag } from "taro-ui";
import { Finance } from 'financejs'
import fp from 'lodash/fp'

import LineChart from "../../components/LineChart";
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
    navigationBarTitleText: '买不买房'
  };

  constructor() {
    super(...arguments);
    this.state = {
      housePrice: 400,
      loan: 280,
      loanYears: 30,
      loanRate: 5.15,
      downPayment: 124,
      houseIncreaseRate: 3,
      rentPrice: 0.6,
      rentIncreaseRate: 5,
      financeCost: 5,
      open: true,
      openModify: false,
      slider: true,
    }

  }


  handleChange(item, value) {
    // console.log('item', value);
    // if (value === '-999' || value === -999) {
    //   value = 0;
    // }
    // console.log('item', value);

    if (value === '-') {
      return value;
    }

    this.setState({
      [item]: Number(value)
    });
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
    return value
  }

  handleSliderChange(item, { value }) {
    this.setState({
      [item]: Number(value)
    });
    return value
  }

  componentWillMount() {
  }

  componentDidMount() {
     // 从url上读取state
     const paramObj = fp.reduce((acc, key) => {
      const value = this.$router.params[key];

      if (value === "true") {
        return Object.assign({}, acc, { [key]: true })
      }

      if (value === "false") {
        return Object.assign({}, acc, { [key]: false })
      }

      return Object.assign({}, acc, { [key]: +value })
    }, {})(Object.keys(this.$router.params))

    this.setState(paramObj,()=>{
      this.throttleUpdateData();
      this.forceUpdate();
    })
    
    Taro.atMessage({
      'message': '请在下方填写房价等基本信息',
      'type': 'info',
    })
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

    // 将现在的state保存在url上
    const queryKey = [
      'housePrice',
      'loan',
      'loanYears',
      'loanRate',
      'downPayment',
      'houseIncreaseRate',
      'rentPrice',
      'rentIncreaseRate',
      'financeCost',
      // 'open',
      'openModify',
      'slider',
    ]
    const query = fp.reduce((acc, key) => {
      return `${acc}${key}=${this.state[key]}&`;
    }, '')(queryKey);

    return {
      title: '买不买房？测试你现在是买房好还是租房好',
      path: `/pages/index/index?${query}`
    }
  }

  refLineChart = (node) => {
    this.lineChart = node
  };

  throttleUpdateData = fp.debounce(500)(this.updateData);


  updateData() {
    const { loanRate, loanYears, loan, houseIncreaseRate, housePrice, rentPrice, rentIncreaseRate, downPayment, financeCost } = this.state;
    const pmt = finance.PMT(loanRate / 100 / 12, loanYears * 12, loan);
    const years = loanYears;
    const getNetAssetBuyingHouseByYear = (year) => getNetAssetBuyingHouse(year * 12, housePrice, houseIncreaseRate, loan, loanRate, pmt)
    const getNetAssetRentingHouseByYear = (year) => getNetAssetRentingHouse(year * 12, rentPrice, rentIncreaseRate, pmt, downPayment, financeCost)
    const toFixed2 = (number) => { return Number(number.toFixed(2)) }
    const range = fp.range(0, years + 1);
    this.assetBuyingHouseArr = fp.map(fp.flow(getNetAssetBuyingHouseByYear, toFixed2))(range)
    this.assetRentingHouseArr = fp.map(fp.flow(getNetAssetRentingHouseByYear, toFixed2))(range)

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
    const { loanRate, loanYears, loan } = this.state;
    const pmt = finance.PMT(loanRate / 100 / 12, loanYears * 12, loan);
    return (
      <View className='index'>
        <AtMessage />


        <View style={{ width: '100%', height: '250px' }}>
          <LineChart ref={this.refLineChart} height='250px' />
        </View>


        <AtAccordion
          open={this.state.openModify}
          onClick={() => {
            this.setState((state) => ({
              openModify: !state.openModify
            }))
          }}
          title='参数调整'
          icon={{ value: 'filter', color: '#6392e5', size: '15' }}
        >
          {this.state.slider && <View style={{ marginTop: '10px' }}>
            <View style={{ lineHeight: '15px', marginLeft: '15px' }}><Text
              style={{ fontSize: '0.7rem' }}
            >房价上涨/下跌比率(%)</Text></View>
            <AtSlider value={this.state.houseIncreaseRate} step={1} min={-20} max={20} showValue
              onChange={this.handleSliderChange.bind(this, 'houseIncreaseRate')}
            />

            <View style={{ lineHeight: '15px', marginLeft: '15px' }}><Text
              style={{ fontSize: '0.7rem' }}
            >房租上涨/下跌比率(%)</Text></View>
            <AtSlider value={this.state.rentIncreaseRate} step={1} min={-20} max={20} showValue
              onChange={this.handleSliderChange.bind(this, 'rentIncreaseRate')}
            />

            <View style={{ lineHeight: '15px', marginLeft: '15px' }}><Text
              style={{ fontSize: '0.7rem' }}
            >投资年化收益率(%)</Text></View>
            <AtSlider value={this.state.financeCost} step={1} min={-20} max={20} showValue
              onChange={this.handleSliderChange.bind(this, 'financeCost')}
            />
          </View>}



          {!this.state.slider && <View style={{ marginTop: '10px' }}>
            <AtInput
              name='houseIncreaseRate'
              title='房价上涨/下跌比率'
              type='text'
              placeholder='请输入数字'
              value={this.state.houseIncreaseRate}
              onChange={this.handleChange.bind(this, 'houseIncreaseRate')}
            >
              <Text> % </Text>
            </AtInput>
            <AtInput
              name='rentIncreaseRate'
              title='房租上涨/下跌比率'
              type='text'
              placeholder='请输入数字'
              value={this.state.rentIncreaseRate}
              onChange={this.handleChange.bind(this, 'rentIncreaseRate')}
            >
              <Text> % </Text>
            </AtInput>
            <AtInput
              name='financeCost'
              title='投资年化收益率'
              type='text'
              placeholder='请输入数字'
              value={this.state.financeCost}
              onChange={this.handleChange.bind(this, 'financeCost')}
            >
              <Text> % </Text>
            </AtInput>
          </View>
          }

          <AtNoticebar style={{
            fontSize: '0.6rem',
            margin: '0 10px',
          }}>
            假设购买的房子现值<Text className='info_number'>{this.state.housePrice}</Text>，
            首付(含税及其他)<Text className='info_number'>{this.state.downPayment}</Text>，
            商业贷款<Text className='info_number'>{this.state.loan}</Text>，利率为<Text className='info_number'>{this.state.loanRate}%</Text>，分<Text className='info_number'>{this.state.loanYears}年</Text>还清，需要月供<Text className='info_number'>{-pmt.toFixed(2)}</Text>。
            获得相同居住体验需要房租每月<Text className='info_number'>{this.state.rentPrice}</Text>，
            按照房价变动每年<Text className='info_number'>{this.state.houseIncreaseRate}%</Text>，房租变动每年<Text className='info_number'>{this.state.rentIncreaseRate}%</Text>，年化投资回报率为<Text className='info_number'>{this.state.financeCost}%</Text>。
            假设每个月支出相同，净资产随时间的变化如上图所示。
          </AtNoticebar>

          <View style={{
            position: 'relative',
            right: '12px',
            textAlign: 'right',
            marginTop: '5px',
            marginBottom: '5px'
          }}
          >
            <AtTag
              name='tag-1'
              type='primary'
              size='small'
              circle
              active
              onClick={() => {
                this.setState((state) => {
                  return {
                    slider: !state.slider
                  }
                })
              }}
            >
              {this.state.slider ? '输入小数？范围不够？' : '回到滑竿模式'}
            </AtTag>
          </View>


          {/* <View className='at-row at-row__justify--around' style={{textAlign: "center", marginTop: '10px'}}>
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
        </View> */}

        </AtAccordion>

        <AtAccordion
          open={this.state.open}
          onClick={() => {
            this.setState((state) => ({
              open: !state.open
            }));
          }}
          title='信息录入'
          icon={{ value: 'edit', color: '#6392e5', size: '15' }}
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
          <AtButton
            type='primary'
            onClick={() => {
              this.setState({ openModify: true });
              Taro.atMessage({
                'message': '左右滑动滑竿，调节参数。图表会实时计算更新',
                'type': 'success',
              })
              Taro.pageScrollTo({
                scrollTop: 0
              })
            }}
            full
          >
            填写完成
            </AtButton>
        </AtAccordion>

      </View>
    )
  }
}

import Taro, {Component} from '@tarojs/taro'
import {View, Text, Input, Picker} from '@tarojs/components'
import './index.scss'
import {AtButton, AtCard, AtDivider, AtForm, AtInput, AtInputNumber, AtTabBar} from "taro-ui";

export default class Index extends Component {

  config = {
    navigationBarTitleText: '首页'
  }


  constructor() {
    super(...arguments)
    this.state = {
      value: ''
    }
  }


  handleChange(value) {
    this.setState({
      value
    })
    // 在小程序中，如果想改变 value 的值，需要 `return value` 从而改变输入框的当前值
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
    return (
      <View className='index'>

        <AtDivider content='选择买房' fontColor='#2d8cf0' lineColor='#2d8cf0'/>

        <AtForm>
          <AtInput
            name='housePrice'
            title='房屋总价'
            type='text'
            placeholder='请输入数字'
            value={this.state.value1}
            onChange={this.handleChange.bind(this)}
          />
          <Picker mode='selector' range={['3成', '5成']} onChange={this.handleChange.bind(this)} className='at-input'>
            <View className='at-input__container'>
              <Text className='picker at-input__title'>
                贷款成数
              </Text>
              <Text className='at-input__input'> 3成 </Text>
            </View>
          </Picker>
          <AtInput
            name='value2'
            title='贷款年数'
            type='number'
            placeholder='请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
            <Text> 年 </Text>
          </AtInput>
          <AtInput
            name='value2'
            title='房贷利率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
            <Text> % </Text>
          </AtInput>

          <AtInput
            name='value2'
            title='首付额外支出'
            type='digit'
            placeholder='税费，中介费等。请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
          </AtInput>


          <AtInput
            name='value2'
            title='房价上涨比率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
            <Text> % </Text>
          </AtInput>

        </AtForm>

        <AtDivider content='选择租房' fontColor='#2d8cf0' lineColor='#2d8cf0'/>


        <AtForm>
          <AtInput
            name='value2'
            title='现在房租'
            type='number'
            placeholder='请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
          </AtInput>
          <AtInput
            name='value2'
            title='房租上涨比率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
            <Text> % </Text>
          </AtInput>
          <AtInput
            name='value2'
            title='投资年化收益率'
            type='digit'
            placeholder='请输入数字'
            value={this.state.value2}
            onChange={this.handleChange.bind(this)}
          >
            <Text> % </Text>
          </AtInput>

        </AtForm>

        <AtButton type='primary'>点击计算</AtButton>
      </View>
    )
  }
}

import React from 'react';
import {
  StyleSheet, Text, View, BackHandler, Dimensions, ToastAndroid, Alert, TouchableOpacity,
} from 'react-native';
import ScanEvent from '../Scanner';
import API from './Api';
import ButtonView from './ButtonView';
import ScannerCode from './ScannerCode';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = height;
const SCREEN_WIDTH = width;
export default class BarcodeScannerView extends React.Component {
  constructor(props) {
    super(props);
    this._didFocusSubscription = props.navigation.addListener('didFocus', payload =>
      BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
    this.state={
      userId: null,
      planId: null,
      type: null,
      dict1: null,
      dict2: null,
      scanSuccess:false,
      isCamera: false,
    };
  }
  state = {
    hasCameraPermission: null,
  }

  async componentDidMount() {
    let config;
    try {
      config = await global.storage.load({
        key: 'config'
      });
    } catch (e) {

    }
    if (!config) {
      global.storage.save({
        key: 'config',
        data: { url: 'http://111.198.65.223:8091' },
        expires: null
      });
      this.urlConfig = 'http://111.198.65.223:8091';
    }else{
      this.urlConfig = config.url;
    }
    ScanEvent.on('scanned', this.onScanned);
    this._willBlurSubscription = this.props.navigation.addListener('willBlur', payload =>
      BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    );
    const paramData = this.props.navigation.state.params;
    const { userId, planId, type } = paramData;
    this.setState({ userId, planId, type });
    ToastAndroid.showWithGravityAndOffset(
      "请扫描设备条形码！",
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      25,
      50
    );
    this.getDict('pandian_report', userId);
    this.getDict('DEVICE_LOCATION', userId);
  }
  onBackButtonPressAndroid = () => {
    const { type, userId } = this.state;
    if (type === 1) {
      this.props.navigation.navigate('InventoryView', { userId });
    } else if (type === 2) {
      this.props.navigation.navigate('CheckView', { userId });
    } else if (type === 3) {
      this.props.navigation.navigate('MaintainView', { userId });
    }
    return true;
  };

  onScanned = data => {
    this.redirect(data.barCode);
  }
  handleBarCodeScanned = ({ type, data }) => {
    this.redirect(data);
  }


  getDict(code, userId){
    let formData = new FormData();
    formData.append("userId",userId);
    formData.append("code",code);
    const that = this;
    fetch(this.urlConfig+API.location+"typeList", {
        method: "POST",
        body: formData,
      }).then(function (res) {
        if (res.ok) {
          res.json().then(function (json) {
            if (json.success) {
              const { obj } = json;
              if(obj){
                  if(code === 'pandian_report'){
                    that.setState({dict1: obj});
                  }
                  if(code === 'DEVICE_LOCATION'){
                    that.setState({dict2: obj});
                  }
              }
            } else if (json.msg) {
              Alert.alert('提示', json.msg, [{ text: '确定', onPress: () => console.log(json) },]);
            }
          });
        } else {
          Alert.alert('提示', '请求失败', [{ text: '确定', onPress: () => console.log('request failed! res=', res) },]);
        }
      }).catch(function (e) {
        console.log("fetch error!", e);
        Alert.alert('提示', '请求失败！', [{ text: '确定', onPress: () => console.log('request error!') },]);
      });
}

  redirect = (data) => {
    const { scanSuccess } = this.state;
    if(scanSuccess){
      return;
    }
    this.setState({ scanSuccess: true });
    const { userId, planId, type, dict1, dict2 } = this.state;
    if (data && userId && planId) {
      let formData = new FormData();
      formData.append("userId", userId);
      formData.append("planId", planId);
      formData.append("codeNbr", data);
      const that = this;
      fetch(this.urlConfig+API.location + "getPlanItemId", {
        method: "POST",
        body: formData,

      }).then(function (res) {
        if (res.ok) {
          res.json().then(function (json) {
            if (json.success) {
              const { obj } = json;
              if (obj) {
                that.setState({ itemInfo: obj.device, itemId: obj.itemId});
                that.props.navigation.navigate('InventoryInfo',{
                  itemId: obj.itemId, itemInfo: obj.device, userId, planId, type, dict1, dict2,
                  report: obj.report,result: obj.result,position: obj.position,
                });
              }else{
                that.props.navigation.navigate('InventoryInfo',{
                  itemId:"", itemInfo:{}, userId, planId, type, dict1, dict2,
                });
                Alert.alert('提示', "设备不存在", [{ text: '确定', onPress: () => that.setState({scanSuccess: false}) },]);
              }
            } else if (json.msg) {
              Alert.alert('提示', json.msg, [{ text: '确定', onPress: () => that.setState({scanSuccess: false}) },]);
            }
          });
        } else {
          Alert.alert('提示', '请求失败', [{ text: '确定', onPress: () => that.setState({scanSuccess: false}) },]);
        }
      }).catch(function (e) {
        console.log("fetch error!", e);
        Alert.alert('提示', '请求失败！', [{ text: '确定', onPress: () => that.setState({scanSuccess: false}) },]);
      });
    }
  }

  render() {
    const { isCamera } = this.state;
    if(isCamera){
      return (
        <View style={{ flex: 1 , backgroundColor: 'white'}}>
          <ScannerCode onScanned={this.redirect}/>
        </View>
      );
    }
    return <View style={{
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text>请扫描设备编码！</Text>
      <ButtonView
          btnName='相机扫描'
          btnStyle={styles.loginBtnStyle}
          onPress={() => {this.setState({isCamera: true})}}
        />
    </View>

  }
}
const styles = StyleSheet.create({
  loginBtnStyle: {
    backgroundColor: '#3385ff', height: 45, width: SCREEN_WIDTH - 100, top: 10, position: 'absolute', margin: 16,
  },
});

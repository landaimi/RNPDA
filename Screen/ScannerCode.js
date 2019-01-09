/**
 * 创建： jiaojiao on 2018/10/23.
 * 功能：扫描二维码
 */
'use strict';
import React, { PureComponent } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    Dimensions,
    Animated,
    InteractionManager,
    Easing,
    Alert,
    Image,
    ImageBackground
} from 'react-native';
import Camera from 'react-native-camera';
let { width, height } = Dimensions.get('window');

export default class MaxCardScreen extends PureComponent {
    static propTypes = {};

    constructor(props) {
        super(props);
        this.state = {
            show: true,
            anim: new Animated.Value(0),
        };
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(() => {
            this.startAnimation()
        });
    }

    startAnimation() {
        if (this.state.show) {
            this.state.anim.setValue(0)
            Animated.timing(this.state.anim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
            }).start(() => this.startAnimation());
        }
    }

    componentWillUnmount() {
        this.state.show = false;
    }

    //扫描二维码方法
    barcodeReceived = (e) => {
        Alert.alert(
            '提示',
            JSON.stringify(e),
            [{ text: '确定' }]
        )
        if (this.state.show) {
            this.state.show = false;
            if (e) {
                Alert.alert(
                    '提示',
                    e.data,
                    [{ text: '确定' }]
                )
            } else {
                Alert.alert(
                    '提示',
                    '扫描失败'
                    [{ text: '确定' }]
                )
            }
        }
    }
    render() {
        return (
            <Camera
                ref={(cam) => { this.camera = cam; }}
                style={styles.preview}
                onBarCodeRead={this.barcodeReceived.bind(this)}
            >
                <View
                    style={{ height: Platform.OS == 'ios' ? (height - 264) / 3 : (height - 244) / 3, width: width, backgroundColor: 'rgba(0,0,0,0.5)', }}>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <View style={styles.itemStyle} />
                    <ImageBackground style={styles.rectangle}
                        source={''}>
                        <Animated.View
                            style={[styles.animatiedStyle, { transform: [{ translateY: this.state.anim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] }) }] }]}>
                        </Animated.View>
                    </ImageBackground>
                    <View style={styles.itemStyle} />
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', width: width, alignItems: 'center' }}>
                    <Text style={styles.textStyle}>将二维码放入框内,即可自动扫描</Text>
                </View>
            </Camera>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: '#efefef'
    },
    itemStyle: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: (width - 200) / 2,
        height: 200
    },
    textStyle: {
        color: '#666',
        marginTop: 20,
        fontSize: 16
    },
    navTitleStyle: {
        color: 'white',
        fontWeight: 'bold',
    },
    navBarStyle: { // 导航条样式
        height: Platform.OS == 'ios' ? 64 : 44,
        backgroundColor: 'rgba(34,110,184,1.0)',
        // 设置主轴的方向
        flexDirection: 'row',
        // 垂直居中 ---> 设置侧轴的对齐方式
        alignItems: 'center',
        justifyContent: 'center'
    },

    leftViewStyle: {
        // 绝对定位
        // 设置主轴的方向
        flexDirection: 'row',
        position: 'absolute',
        left: 10,
        bottom: Platform.OS == 'ios' ? 15 : 12,
        alignItems: 'center',
        width: 30
    },
    animatiedStyle: {
        height: 2,
        backgroundColor: '#00FF00'
    },

    preview: {
        flex: 1,
    },
    rectangle: {
        height: 200,
        width: 200,
    }
});

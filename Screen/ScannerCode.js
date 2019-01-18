/**
 * 创建： jiaojiao on 2018/10/23.
 * 功能：扫描二维码
 */
'use strict';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Animated,
    Easing,
    Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
let { width, height } = Dimensions.get('window');
class ScanScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            moveAnim: new Animated.Value(0)
        };
    }

    componentDidMount() {
        this.startAnimation();
    }

    startAnimation = () => {
        this.state.moveAnim.setValue(1);
        Animated.timing(
            this.state.moveAnim,
            {
                toValue: -300,
                duration: 1500,
                easing: Easing.linear
            }
        ).start(() => this.startAnimation());
    };
    //  识别二维码
    onBarCodeRead = (result) => {
        const { onScanned } = this.props;
        onScanned(result.data);
    };

    render() {
        return (
            <View style={styles.container}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.on}
                    onBarCodeRead={this.onBarCodeRead}
                >
                    <View style={styles.rectangleContainer}>
                        <View style={styles.rectangle}/>
                        <Animated.View style={[
                            styles.border,
                            {transform: [{translateY: this.state.moveAnim}]}]}/>
                        <Text style={styles.rectangleText}>将二维码放入框内，即可自动扫描</Text>
                    </View>
                    </RNCamera>
            </View>
        );
    }
}

export default ScanScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    rectangleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
    },
    rectangle: {
        height: 280,
        width: 280,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.5)',
        backgroundColor: 'transparent'
    },
    rectangleText: {
        flex: 0,
        color: '#fff',
        marginTop: 10
    },
    border: {
        flex: 0,
        width: 280,
        height: 2,
        backgroundColor: '#00FF00',
    }
});

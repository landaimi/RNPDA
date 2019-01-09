import EventEmitter from 'events';
import { AppRegistry } from 'react-native';
const scannerEvent = new EventEmitter();

export default scannerEvent;

AppRegistry.registerHeadlessTask('ScanBarCodeTaskService', () => async (data) => {
    console.log('onScanned', data);
    scannerEvent.emit('scanned', data);
});

import AsyncStorage from '@react-native-community/async-storage';

const key = 'status';
export default class Storage {
  
  static async getValue(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // value previously stored
        const result = JSON.parse(value);
        return result;
      } else {
        return null;
      }
    } catch (e) {
      console.log(`storage读取${key}报错`);
    }
  }
  
  static async setValue(key, value) {
    console.log(key,value,'存储');
    try {
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.log(`storage存储${key}报错`);
    }
  }
  
  static async removeValue(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.log(`storage删除${key}报错`);
    }
  }
}

import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

import {navigationConfig} from '../../common/navigation';
import {Btn, Layout} from '../../componments';
import {Images} from '../../common/images';
import {Navigation} from 'react-native-navigation';
import Router from '../../Router';


class BillPayResult extends Component <Props, State> {
  constructor(props: Object) {
    super(props);
    this.state = {};
  }
  
  render() {
    return (
      <Layout style={styles.page}>
        <View style={styles.header}>
          <Image source={Images.bill.PayResult1} style={styles.img}/>
          <Text style={styles.text}>请联系您的专属客服进行还款</Text>
        </View>
        <Btn onPress={()=>{
          // Navigation.popTo(Router.HOME);
          Navigation.setStackRoot(this.props.componentId, {
            component: {
                name: Router.HOME,
            },
        });
        }}>完成</Btn>
      </Layout>
    );
  }
  
}

BillPayResult.options = navigationConfig('支付');

// 定义样式
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f7f7f7',
    flex: 1,
    paddingTop: 41,
  },
  header: {
    alignItems: 'center',
  },
  img: {
    width: 140.5,
    height: 110.5,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: '#757575',
    marginTop: 29.5,
    marginBottom: 50,
  },
  
});


export default BillPayResult;

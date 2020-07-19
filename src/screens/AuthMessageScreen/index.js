import React, { Component } from 'react';
import { View, Text, Button, StyleSheet, Image, FlatList } from 'react-native'

import { screen, system } from '../../utils/common'

import { Heading2 } from '../../widget/Text'

import { LayoutScroll, Layout, Line, Touchable, Confirm, Btn } from '../../componments';
import { ToastShow } from '../../utils/toast';

// redux & router
import { connect } from 'react-redux';
import Router from '../../Router';
import { navigationConfig } from '../../common/navigation';
// 跳转组件
import { Navigation } from 'react-native-navigation';


import color from '../../widget/color'
import { Images } from '../../common/images';



class AuthMessageScreen extends Component<Props, State>{


  constructor(props: Object) {
    super(props);
    this.state = {
      isRefreshing: false,
    }

  }


  componentDidMount() {
    // 初始化授权列表 
    this.InitCreaditAuthList()
  }


  // 初始化授权列表
  InitCreaditAuthList() {
    const { dispatch } = this.props;
    dispatch({ type: 'CreaditAuth', payload: {} });
  }


  /*页面跳转*/
  JumpPage(com, item) {

    console.log(com, item, 887777)

    const { dispatch } = this.props;
    // 当前用户选择的id
    dispatch({
      type: 'CreditNoSelect',
      payload: { ...item },
      callback: (res) => {
        // console.log(23232323, res)
        Navigation.push(this.props.componentId, {
          component: {
            name: com,
            options: {
              bottomTabs: {
                visible: false,
                drawBehind: true,
                animate: true,
              },
            },
          },

        });
      }
    });

  }
  // 去认证列表页
  GoAuthList() {
    // 判断当前是否已经上传图

    const { authList } = this.props.NSAuthpersonal;

    const arrNew = [];

    authList.map((item, index) => {
      if (item.isUpload) {
        arrNew[index] = item.number;
      }
    });

    console.log(8888, authList)

    for (let i = 0; i < arrNew.length; i++) {
      if (arrNew[i] < 1) {
        ToastShow('必须先上传授信信息');
        return false;
      }
    }

    Navigation.setStackRoot(this.props.componentId, {
      component: {
        name: Router.AUTH,
        options: {
          bottomTabs: {
            visible: false,
            drawBehind: true,
            animate: true,
          },
        },
      },
    });

  }


  render() {
    // 获取当前授权列表
    const { authList } = this.props.NSAuthpersonal;

    return (

      <LayoutScroll style={{ position: 'relative', backgroundColor: '#F7F7F7' }} showStatusBar={true}>

        <View style={styles.page_container}>
          <FlatList
            data={authList}
            numColumns={2}
            keyExtractor={(item, index) => index}
            renderItem={({ item }) =>
              <Touchable onPress={() => {
                console.log(item.creditTypeNo, item.creditTypeKey, '当前点击选中');
                this.JumpPage(Router.UPLOAD, item);
              }}
                style={styles.container_box}
              >
                <Image style={styles.container_box_img} source={Images.public.Testlogo} />

                <View style={styles.pages_container_title}>
                  <Image style={styles.content_img} source={{ uri: item.creditTypeIcon }} />
                  <Text style={styles.content_text}>{item.creditTypeName}</Text>
                  <Text style={styles.content_text_status}>{item.isUpload ? '(必传)' : ''}  </Text>
                </View>

                <View style={styles.pages_container_update}>
                  <Text style={styles.pages_title}>{item.number}</Text>
                  <Text style={styles.update_photo} >修改</Text>
                </View>

              </Touchable>

            }
          />
        </View>

        {/*  跳转到认证页 */}
        <Btn onPress={() => {
          this.GoAuthList()
        }}>提交</Btn>

      </LayoutScroll>


    )
  }


}

// 定义标题
AuthMessageScreen.options = navigationConfig('授信信息');
// 定义样式
const styles = StyleSheet.create({
  icon: {
    width: 27,
    height: 27,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
  },

  container: {
    flex: 1,
  },
  // 初审补充信息
  page_container: {
    flexDirection: 'row',
    marginTop: 20,
    flex: 1,
    marginHorizontal:20,
  },
  container_box: {
    width: 159.5,
    height: 192,
    borderStyle: 'solid',
    borderRightColor: '#F0F0F0',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    marginBottom: 12,
    marginHorizontal:10,
  },
  pages_title: {
    position: 'absolute',
    left: 10,
    color: '#212121',
    fontSize: 12,
  },
  container_box_end: {
    width: 93,
    height: 110,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingTop: 26,

  },
  container_box_img: {
    width: 159.5,
    height: 126.6,
  },
  update_photo: {
    position: 'absolute',
    right: 20,
    color: '#67C2F7',
    fontSize: 12,
  },
  pages_container_title: {
    flexDirection: 'row',
    marginTop: 9.5,
    paddingLeft: 6,
    paddingRight: 5,
  },
  pages_container_update: {
    flexDirection: 'row',
    paddingLeft: 6,
    paddingRight: 5,
    paddingTop: 12.5,
  },
  images_count: {
    position: 'absolute',
    left: 10,
  },
  content_img: {
    width: 18,
    height: 18,
  },
  content_text_status: {
    height: 32,
    fontSize: 13,
    marginTop: 3,
    alignSelf: 'center',
    alignItems: 'center',
    color: '#FF4248',
  },
  content_text: {
    height: 32,
    fontSize: 13,
    marginTop: 3,
    marginLeft: -15,
    alignSelf: 'flex-start',
  },
  login: {
    width: 343,
    height: 49,
    position: 'absolute',
    bottom: 20,
    borderRadius: 24.5,
    alignSelf: 'center',
  },
  loginText: {
    lineHeight: 49,
    fontSize: 25,
    color: '#FFFFFF',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
})


export default connect(({ NSAuthpersonal, NSBasic }) => ({ NSAuthpersonal, NSBasic }))(AuthMessageScreen);
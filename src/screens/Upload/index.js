import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Modal, Linking } from 'react-native'
import axios from 'axios'
import { screen, system } from '../../utils/common'

import { Heading2, Heading3, Paragraph } from '../../widget/Text'

// redux & router
import { connect } from 'react-redux';
import Router from '../../Router';
import { LayoutScroll, Touchable, Btn } from '../../componments/index';
// 跳转组件
import { Navigation } from 'react-native-navigation';
import color from '../../widget/color'
import { navigationConfig } from '../../common/navigation';
// 上传
import Upload from 'react-native-background-upload';
import ImagePicker from 'react-native-image-picker';
import Toast from 'react-native-simple-toast';
// 图片点击放大
import ImageViewer from 'react-native-image-zoom-viewer';
import { Images } from '../../common/images';
import { ToastShow } from '../../utils/toast';
import RNRestart from 'react-native-restart';



const commonOptions = {
  url: '',
  path: '',
  method: 'PUT',
  type: 'raw',
  // only supported on Android
  notification: {
    enabled: true,
  },
};

class AlipayScreen extends Component<Props, State>{

  constructor(props: Object) {
    super(props);
    this.TimeOutCount = null;
    this.state = {
      imgList: [],
      modalVisible: false,
      imagesModal: [],
    }

  }

  componentDidMount() {
    // 当前用户是否已经上传图
    this.InitGetUserImgList()
    // 定时 刷新 
    this.initLoadUpload();
  }


  initLoadUpload() {

    if (this.TimeOutCount != null) {
      clearTimeout(this.TimeOutCount);
    }
    this.TimeOutCount = setTimeout(() => {
      const { imgList } = this.props.NSAuthpersonal;
      if (this.props.NSAuthpersonal.selectCreditTypeNo.number > 0) {
        this.setState({
          imgList: imgList
        })
      }
    }, 1000);
  }


  // 当前用户是否已经上传图
  InitGetUserImgList() {
    if (this.props.NSAuthpersonal.selectCreditTypeNo.number > 0) {
      const { dispatch } = this.props;
      dispatch({
        type: 'SelectCreditListDetail', payload: {
          creditTypeNo: this.props.NSAuthpersonal.selectCreditTypeNo.creditTypeNo,
          clientNo: this.props.NSIndex.clientInfo.clientNo,
        }
      });
      const { imgList } = this.props.NSAuthpersonal;
      this.setState({
        imgList: imgList
      })

    }

  }



  /*正面上传*/
  uploadUserinfo(type) {
    const options = {
      title: null,
      mediaType: 'photo',
      cameraType: 'back',
      noData: true,
      quality: 1.0,
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照',
      chooseWhichLibraryTitle: '从图库选择',
      chooseFromLibraryButtonTitle: '选择图片',
      storageOptions: {
        skipBackup: true,
        waitUntilSaved: false,
        cameraRoll: true,
        path: '/'
      },
    };
    ImagePicker.showImagePicker(options, (response) => {

      if (response.didCancel) {
        //  用户取消选择图片了
        console.log("取消了")
      }
      else if (response.error) {
        // console.log('ImagePicker Error: ', response.error);
        this.setState({
          visible1: true
        })

        if (response.error.indexOf('Camera permissions not granted') > -1) {
          ToastShow('APP需要使用相册，请打开相册权限允许APP使用');

          if (this.TimeOutCount != null) {
            clearTimeout(this.TimeOutCount);
          }
          this.TimeOutCount = setTimeout(() => {
            Linking.openURL('app-settings://')
          }, 2000);


        }
        if (response.error.indexOf('Photo library permissions not granted') > -1) {
          ToastShow('APP需要使用相册，请打开相册权限允许APP使用');

          if (this.TimeOutCount != null) {
            clearTimeout(this.TimeOutCount);
          }
          this.TimeOutCount = setTimeout(() => {
            Linking.openURL('app-settings://')
          }, 2000);
        }

        //  选图片报错
      } else if (response.customButton) {
        //  自定义按钮
        // console.log("自定义按钮")
      } else {

        let { fileName, uri } = response;
        let sub_suffix = '';
        if (!fileName) {
          const i = uri.lastIndexOf('/') + 1;
          const suffixIndex = uri.lastIndexOf('.') + 1;
          fileName = uri.substring(i);
          sub_suffix = uri.substring(suffixIndex);
        }
        const source = {
          uri: response.uri,
          type: 'application/octet-stream',
          name: fileName
        };
        // 区分当前是信息认证还是补充材料
        const { creditTypeKey } = this.props.NSAuthpersonal.selectCreditTypeNo;

        this.UploadFileOss(sub_suffix, creditTypeKey, source, fileName);
      }
    });
  }

  // 文件上传

  UploadFileOss(sub_suffix, creditTypeKey, source, fileName) {
    /*图片上传*/
    const { dispatch } = this.props;

    dispatch({
      type: 'GetOssSign',
      payload: {
        fileType: creditTypeKey,
        fileNumber: 1,
        suffix: sub_suffix,
      },
      callback: (res) => {

        if (res.code == 0) {
          //正在上传
          Toast.show('正在上传...');
          const { host, accessId, dir, policy, signature, callback, fileName } = res.data;
          const data_params = new FormData();
          data_params.append("key", dir + fileName);
          data_params.append("policy", policy);
          data_params.append("OSSAccessKeyId", accessId);
          data_params.append("success_action_status", '200');
          data_params.append("callback", callback);
          data_params.append("Signature", signature);
          // data_params.append("file",fileName);
          data_params.append("file", source, fileName);


          /*上传到OSS*/
          axios({
            url: host,
            method: 'post',
            data: data_params,
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(res => {
            if (res.status === 200) {

              // 临时展示列表
              const creditUrlPath = `${host}/${dir}` + fileName;
              let urlPath = {
                creditUrlPath: creditUrlPath,
                id: this.getRandom(10000, 99999),
              }
              this.setState({
                imgList: [...this.state.imgList, urlPath]
              })
            } else {
              Toast.hide();
            }
          }).catch(e => {
            Toast.show('图片上传失败');
          })
        }
      }
    });
  }
  // 图片临时id
  getRandom(n, m) {
    var num = Math.floor(Math.random() * (m - n + 1) + n)
    return num
  }

  // 弹窗修改值

  getItem(url) {
    this.setState({
      modalVisible: true,
      imagesModal: [{
        url: url,
      }]
    })
    // console.log(this.state.imagesModal)
  }
  // 删除当前数组的数据
  DeleteImgList(item_list) {
    const { dispatch } = this.props;
    const { imgList } = this.state;
    const { id } = item_list;
    const newArr = imgList.filter(obj => obj.id !== id)
    this.setState({
      imgList: newArr,
    })
  }
  // 提交当前用户上传的文件，并刷新reducers数据
  submitUpload() {
    const { dispatch } = this.props;
    const { imgList } = this.state;
    const { clientNo } = this.props.NSIndex.clientInfo;
    // 区分提交的TypeNo
    const { creditTypeNo } = this.props.NSAuthpersonal.selectCreditTypeNo;

    if (imgList.length < 1) {
      ToastShow('必须上传图片才能提交');
      return false;
    }

    // 处理更新后的path路径
    imgList.forEach((item, index) => {
      imgList[index] = item.creditUrlPath;
    });

    dispatch({
      type: 'AddCreditListDetail', payload: {
        creditUrlPath: imgList,
        creditTypeNo: creditTypeNo,
      },
      callback: (res) => {
        if (res.code == 0) {

          Toast.show('上传成功');
          // 根据是否全部认证判断是否还需要进入上传 认证信息页

          // 每次成功后触发 信息认证状态
          this.init()
          Navigation.push(this.props.componentId, {
            component: {
              name: Router.AUTHOTHER,
              options: {
                bottomTabs: {
                  visible: false,
                  drawBehind: true,
                  animate: true,
                },
              },
            },
          });
        } else {
          Toast.show('upload失败');
        }
      }
    });
  }



  // 初始化认证列表
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'InitAuthInfoListState',
      payload: {},
    });
  }



  render() {
    const { imagesModal, imgList } = this.state;


    // if(!imgList ){
    //   imgList = [0,0];
    // }


    return (
      <LayoutScroll  >
        <View style={styles.headerContaier}>

            <FlatList
              data={ imgList || [] }
              numColumns={3}
              keyExtractor={(item, index) => index}
              renderItem={({ item }) =>

                <View style={styles.container_box} id={item.id} >
                  <Touchable onPress={() => {
                    // 修改当前弹窗状态
                    this.getItem(item.creditUrlPath)
                  }}>
                    <Image style={styles.content_img} source={{ uri: item.creditUrlPath }} />

                  </Touchable>

                  <Touchable onPress={() => {
                    // 修改当前弹窗状态
                    this.DeleteImgList(item)
                  }} style={styles.delete_img}>

                    <Image style={styles.delete_img} source={Images.public.Delete} />

                  </Touchable>

                </View>
              }
            />

        </View>

        <View style={styles.container_box}  >
          <Touchable onPress={() =>
            this.uploadUserinfo('alipay')
            // 添加图
          } >
            <Image style={styles.content_img} source={{ uri: 'http://res.jqtianxia.cn/test/add.png' }} />
          </Touchable>
        </View>

        {/* 弹窗图 */}
        <Modal visible={this.state.modalVisible}
          transparent={true}
          onRequestClose={() => this.setState({ modalVisible: false })}
          onCancel={() => this.setState({ modalVisible: false })}
        >
          <ImageViewer
            enableImageZoom={false}
            onClick={() => {
              this.setState({
                modalVisible: false
              })
            }} imageUrls={imagesModal} />
        </Modal>


        <Btn style={styles.cardBtn} onPress={() => {
          this.submitUpload();
        }}>提交</Btn>
      </LayoutScroll >

    )
  }


}

AlipayScreen.options = navigationConfig('上传');
// 定义样式
const styles = StyleSheet.create({
  icon: {
    width: 27,
    height: 27,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 188,
  },
  headerContaier: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 28,
  },
  container_box: {
    width: 101,
    height: 100,
    marginLeft: 20,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content_img: {
    width: 80,
    height: 80,
  },
  delete_img: {
    width: 14,
    height: 14,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardBtn: {
  },

})
export default connect(({ NSAuthpersonal, NSIndex, NSBasic }) => ({ NSAuthpersonal, NSIndex, NSBasic }))(AlipayScreen);


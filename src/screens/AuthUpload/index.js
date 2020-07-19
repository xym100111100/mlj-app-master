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
// 上传
import Upload from 'react-native-background-upload';
import ImagePicker from 'react-native-image-picker';
import Toast from 'react-native-simple-toast';
// 图片点击放大
import ImageViewer from 'react-native-image-zoom-viewer';
import { Images } from '../../common/images';
import { ToastShow } from '../../utils/toast';
import { navigationConfig } from '../../common/navigation';



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

class AuthUploadScreen extends Component<Props, State>{

    constructor(props: Object) {
        super(props);
        this.state = {
            imgList: [],
            submitOssList: [],
            modalVisible: false,
            imagesModal: [],
        }

    }

    componentDidMount() {
        // 当前用户是否已经上传图
        this.InitGetUserImgList()
    }


    // 当前用户是否已经上传图
    InitGetUserImgList() {

        // 如果state存在 则加载
        const { customerList, opertionList, noticeList, bankPhotoList } = this.props.NSAuthpersonal;
        // 根据用户选择的 获取不同数据  
        const { certificateTypeNo } = this.props.NSAuthpersonal.selectCreditTypeNoAuthData;

        if (certificateTypeNo && certificateTypeNo !== null) {
            switch (certificateTypeNo) {
                case '30003':
                    this.setState({
                        imgList: customerList
                    })
                    break;
                case '30004':
                    this.setState({
                        imgList: opertionList
                    })
                    break;
                case '30005':
                    this.setState({
                        imgList: noticeList
                    })
                    break;
                case '30006':
                    this.setState({
                        imgList: bankPhotoList
                    })
                    break;
                default:
                    break;
            }
        }
    }


    /*正面上传*/
    uploadUserinfo() {
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
            } else {
                let { fileName, uri } = response;
                let sub_suffix = '';
                if (!fileName) {
                    const i = uri.lastIndexOf('/') + 1;
                    const suffixIndex = uri.lastIndexOf('.') + 1;
                    fileName = uri.substring(i);
                    sub_suffix = uri.substring(suffixIndex);
                } else {
                    // 获取sub_suffix
                    const suffixIndex = uri.lastIndexOf('.') + 1;
                    sub_suffix = uri.substring(suffixIndex);
                }
                const source = {
                    uri: response.uri,
                    type: 'application/octet-stream',
                    name: fileName
                };
                // 区分当前是信息认证还是补充材料
                const { certificateTypeKey } = this.props.NSAuthpersonal.selectCreditTypeNoAuthData;

                this.UploadFileOss(sub_suffix, certificateTypeKey, source, fileName);
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
                            const certificateUrlPath = `${host}/${dir}` + fileName;
                            const { imgList } = this.state;
                            const { certificateTypeKey, certificateTypeName, certificateTypeNo } = this.props.NSAuthpersonal.selectCreditTypeNoAuthData;


                            // 上传成功之后直接保存在当前页，点击提交时触发当前关联的reducer修改
                            if (imgList && imgList !== undefined) {
                                let urlPath = {
                                    certificateUrlPath: certificateUrlPath,
                                    id: this.getRandom(1, 99999),
                                    certificateTypeKey: certificateTypeKey,
                                    certificateTypeName: certificateTypeName,
                                    certificateTypeNo: certificateTypeNo,
                                };
                                this.setState({
                                    imgList: [...imgList, urlPath]
                                })
                            } else {
                                let urlPath = [{
                                    certificateUrlPath: certificateUrlPath,
                                    id: this.getRandom(1, 99999),
                                    certificateTypeKey: certificateTypeKey,
                                    certificateTypeName: certificateTypeName,
                                    certificateTypeNo: certificateTypeNo,
                                }];
                                this.setState({
                                    imgList: urlPath
                                })
                            }

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
    }
    // 删除当前数组的数据
    DeleteImgList(item_list) {
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


        if (imgList.length < 1) {
            ToastShow('必须上传图片才能提交');
            return false;
        }

        // 区分提交的TypeNo 然后调用不同的type 修改当前已经上传图的列表
        let disType = '';
        const { certificateTypeNo } = this.props.NSAuthpersonal.selectCreditTypeNoAuthData;
        switch (certificateTypeNo) {
            case '30003':
                disType = 'UpdateAuthUploadList';
                break;
            case '30004':
                disType = 'UpdateAuthOperationList';
                break;
            case '30005':
                disType = 'UpdateAuthNoticeList';
                break;
            case '30006':
                disType = 'UpdateAuthBankList';
                break;
            default:
                break;
        }
        dispatch({
            type: disType, payload: {
                imgList,
            },
            callback: (res) => {

                Toast.show('上传成功');
                // todo 跳转到继续处理数据页
                // 判断当前已经是否上传所有照片 然后跳不同页面  可能有更多不同的情况需要判断
                // 已上传的补充材料项目数量
                const { customerList, opertionList, noticeList, bankPhotoList } = this.props.NSAuthpersonal;
                let datai = 0;
                if (customerList && customerList.length > 0) {
                    datai++;
                }
                if (opertionList && opertionList.length > 0) {
                    datai++;
                }
                if (noticeList && noticeList.length > 0) {
                    datai++;
                }
                if (bankPhotoList && bankPhotoList.length > 0) {
                    datai++;
                }
                if (datai > 3) {
                    Navigation.push(this.props.componentId, {
                        component: {
                            name: Router.LOANCONFIRM,
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
                    Navigation.push(this.props.componentId, {
                        component: {
                            name: Router.AUTHDATA,
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

            }
        });
    }



    render() {
        const { imgList, imagesModal } = this.state;

        return (
            <LayoutScroll
            >
                <View style={styles.headerContaier}>
                    <FlatList
                        data={imgList}
                        numColumns={3}
                        keyExtractor={(item, index) => index}
                        renderItem={({ item }) =>

                            <View style={styles.container_box} id={item.id} >
                                <Touchable onPress={() => {
                                    // 修改当前弹窗状态
                                    console.log(item,9999222)
                                    this.getItem(item.certificateUrlPath)
                                }}>
                                    <Image style={styles.content_img} source={{ uri: item.certificateUrlPath }} />

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
                        this.uploadUserinfo()
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
            </LayoutScroll>

        )
    }


}
AuthUploadScreen.options = navigationConfig('上传');
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
export default connect(({ NSAuthpersonal, NSIndex }) => ({ NSAuthpersonal, NSIndex }))(AuthUploadScreen);


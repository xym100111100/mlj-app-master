import React, { Component, Fragment } from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';

import { Layout, LayoutScroll, Touchable } from '../../componments/index';
import { connect } from 'react-redux';
import Router from '../../Router';
// 跳转组件
import { Navigation } from 'react-native-navigation';
import InputLayer from '../../container/InputLayer';
import HomeCard from '../../container/HomeCard';
import { ToastShow } from '../../utils/toast';
import { Images } from '../../common/images';
import { imgMode, height, width } from '../../utils/screen';

// 弹窗
class HomeScreen extends Component {
  constructor(props: Object) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount() {
    // 初始化首页基本信息
    this.initIndexInfo();
  }


  // 初始化用户信息
  initUserInfo(callback) {
    const { dispatch } = this.props;
    dispatch({
      type: 'initClientInfo',
      payload: {},
      callback: () => {
        callback && callback();
      },
    });
  }

  // 绑定销售客户ID和取消
  bindServiceId(sid) {
    const self = this;
    if (!sid) {
      ToastShow('请输入正确的客服号');
      return false;
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'initBindServiceInfo',
      payload: {
        salesmanId: sid,
      },
      callback: (res) => {
        if (res.code == 0) {
          ToastShow(res.data);
        }
        this.setState({
          visible: false,
        });
      },
    });

  }

  // 初始化首页信息
  initIndexInfo(callback) {
    const { dispatch } = this.props;
    dispatch({
      type: 'initIndexInfo',
      callback: () => {
        callback && callback();
      },
    });
  }

  // 下拉刷新
  async onRefresh(callback) {
    await this.initUserInfo();
    await this.initIndexInfo();
    callback();
  }
  // 按钮点击跳转逻辑
  HomeStatus() {
    const { clientInfo } = this.props.NSIndex;
    const { userInfo } = this.props.NSUser;
    const { salesmanId } = userInfo;
    const { state, repay } = clientInfo;
    // 0 未实名
    // 1 实名中
    // 2 未授信【初审】
    // 3 授信中
    // 4 已授信
    console.log(state, 9898)
    if (salesmanId && salesmanId !== null) {
      switch (state) {
        // 未实名-去实名
        case 0:
        case 1:
          Navigation.push(this.props.componentId, {
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
          break;
        // 已实名，不做任何操作
        case 2:
          Navigation.push(this.props.componentId, {
            component: {
              name: Router.LOAN,
              options: {
                bottomTabs: {
                  visible: false,
                  drawBehind: true,
                  animate: true,
                },
              },
            },
          });
          break;
        case 3:
          // 授信中
          console.log('初审中，不做任何操作');
          break;
        case 4:
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
          break;
        case 5:
          // 授信中
          console.log('授信拒绝');
          break;
        case 6:
          // 授信中
          console.log('放款中');
          break;
        case 7:
          // 这里判断是否有账单，如果有账单，就进入账单页面
          if (repay !== null) {
            // 账单页面
            Navigation.push(this.props.componentId, {
              component: {
                name: Router.BILL,
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
            // 去借款页面 确认页面  当前状态是否需要判断已经提交过的状态
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
          }
          break;
      }
    } else {
      this.setState({
        visible: true,
      });
    }
  };

  render() {
    const { clientInfo } = this.props.NSIndex;

    return (
      <Layout style={styles.index} showStatusBar={true}>
        <LayoutScroll
          style={styles.indexScroll}
          showStatusBar={true}
          pullRefresh={true}
          callback={(fn) => {
            // 下拉回调
            this.onRefresh(fn);
          }}
        >
          <View style={styles.page}>
            {/*topBar*/}
            <View style={styles.topBar}>
              <Image style={styles.logo} source={Images.home.Logo} />
              {/* <Touchable onPress={() => {
                Navigation.push(this.props.componentId, {
                  component: {
                    name: Router.AUTH,
                  },
                });
              }} style={styles.right}>
                <Image style={styles.rightIcon} source={Images.home.IconMsg} />
              </Touchable> */}
            </View>

            {/*banner*/}
            <View style={styles.banner}>
              <Image style={styles.bannerImg} resizeMode={imgMode} source={Images.home.Banner} />
            </View>

            {/*借款卡片*/}
            {clientInfo && <HomeCard
              callback={() => {
                this.HomeStatus();
              }}
              data={clientInfo} />}

          </View>
        </LayoutScroll>

        {/*    绑定销售弹框*/}
        {this.state.visible && <InputLayer
          callback={(value) => {
            this.bindServiceId(value);
          }}
          onClose={() => {
            this.setState({
              visible: false,
            });
          }}
        />}

      </Layout>
    );
  }

}

// 定义样式
const styles = StyleSheet.create({
  index: {
    flex: 1,
    position: 'relative',
  },
  indexScroll: {
    backgroundColor: '#f5f5f5',
  },
  // 页面布局
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  // 顶部栏
  topBar: {
    flexDirection: 'row',
    height: 60,
    paddingLeft: 18,
    paddingRight: 12.5,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  logo: {
    width: 96,
    height: 24,
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightIcon: {
    width: 25,
    height: 25,
  },

  // banner
  banner: {
    width,
    height: 214,
  },
  bannerImg: {
    width,
    height: 214,
    backgroundColor: 'yellow',
  },
});

export default connect(({ NSIndex, NSUser }) => ({ NSIndex, NSUser }))(HomeScreen);

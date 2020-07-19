import React, { Component } from 'react';
import { View, Text, Button, Platform, TextInput, StyleSheet, Image, PermissionsAndroid, FlatList } from 'react-native'

import { Btn, Layout, LayoutScroll, Line, Touchable, ListItem, Avatar } from '../../componments';
import { navigationConfig } from '../../common/navigation';
import Picker from 'ht-react-native-picker';
import { connect } from 'react-redux';
import { getPixel } from '../../utils/screen';
import { ToastShow } from '../../utils/toast';
import { Images } from '../../common/images';

// 通讯录
import DeviceInfo from 'react-native-device-info';
import Contacts from "react-native-contacts";



class ContactScreen extends Component<Props, State>{

    constructor(props: Object) {
        super(props);
        this.state = {
            contacts: [],
            searchPlaceholder: "Search",
            typeText: null,
            loading: true
        }

        Contacts.iosEnableNotesUsage(true);

    }

    async componentDidMount() {
        if (Platform.OS === "android") {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
                title: "Contacts",
                message: "This app would like to view your contacts."
            }).then(() => {
                this.loadContacts();
            });
        } else {
            this.loadContacts();
        }
    }

    // 获取用户联系人列表
    loadContacts() {
        Contacts.getAllWithoutPhotos((err, contacts) => {
            console.log(err,contacts,99999)
            if (err === "denied") {
                console.warn("Permission to access contacts was denied");
            } else {
                console.log(contacts,2222)
                this.setState({ contacts, loading: false });
            }
        });

        Contacts.getCount(count => {
            this.setState({ searchPlaceholder: `Search ${count} contacts` });
        });
    }


    onPressContact(contact) {
        var text = this.state.typeText;
        this.setState({ typeText: null });
        if (text === null || text === '')
            Contacts.openExistingContact(contact, () => { })
        else {
            var newPerson = {
                recordID: contact.recordID,
                phoneNumbers: [{ label: 'mobile', number: text }]
            }
            Contacts.editExistingContact(newPerson, (err, contact) => {
                if (err) throw err;
                //contact updated
            });
        }
    }

    // 获取银行卡类型
    // initBankTypeList() {
    //     const { dispatch } = this.props;
    //     dispatch({
    //         type: 'BankTypeList',
    //         payload: {},
    //         callback: (res) => {
    //             this.setState({
    //                 bankTypeList: res.data,
    //             });
    //             this.initBankTypePicker();
    //         },
    //     });
    // }


    render() {
        console.log(this.state,88787)
        return (

            <LayoutScroll style={styles.pages_bg }>
                <View style={styles.pages}>
                    {this.state.contacts.map(contact => {
                        <ListItem
                            leftElement={
                                <Avatar
                                    img={
                                        contact.hasThumbnail
                                            ? { uri: contact.thumbnailPath }
                                            : undefined
                                    }
                                    placeholder={getAvatarInitials(
                                        `${contact.givenName} ${contact.familyName}`
                                    )}
                                    width={40}
                                    height={40}
                                />
                            }
                            key={contact.recordID}
                            title={`${contact.givenName} ${contact.familyName}`}
                            description={`${contact.company}`}
                            onPress={() => this.onPressContact(contact)}
                            onDelete={() =>
                                Contacts.deleteContact(contact, () => {
                                    this.loadContacts();
                                })
                            }
                        />
                    })}

                </View >
            </LayoutScroll>

        )
    }

}
// 定义样式
const styles = StyleSheet.create({
    pages_bg: {
        flex: 1,
        backgroundColor: '#fff'
    },
    pages: {
        color: '#F7F7F7',
        flex: 1,
    },
    container: {
        flex: 1,
        marginTop: 20, //去除状态栏图标
        color: 'white',
        height: 120,
    },
    container_bank: {
        flex: 1,
        marginTop: 20,
        color: 'white',
        height: 240,
    },
    container_school: {
        flex: 1,
        marginTop: 20,
        color: 'white',
        height: 240,
    },
    container_phone: {
        flex: 1,
        marginTop: 20,
        color: 'white',
        height: 120,
        marginBottom: 168,
    },
    itemContainer: {
        flexDirection: 'row',
    },
    message: {
        width: 20,
        height: 20,
        marginRight: 20,
        marginTop: 0,
    },
    contact_user: {
        fontSize: 16,
        color: '#F64976'
    },
    contact_user_right: {
        position: 'absolute',
        right: 16,
    },
    contact_text: {
        width: 120,
        fontSize: 17
    },
    service: {
        width: 343,
        height: 49,
        borderRadius: 24.5,
        backgroundColor: '#CCCCCC',
        alignSelf: 'center',
        marginTop: 12,
    },

    serviceText: {
        lineHeight: 49,
        fontSize: 25,
        color: '#FFFFFF',
        alignSelf: 'center',

    },
    safeImg: {
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignContent: 'center',
    },
    service_icon: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    safeText: {
        fontSize: 12,
        flexDirection: 'row',
        color: '#9E9E9E',
        lineHeight: 16.5,
        marginLeft: 10,
    },
    message_code: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: '#FFF',

    },
    textInputTitle: {
        width: 159,
        fontSize: 17,
        color: '#BBBBBB',
        paddingVertical: 18,
        paddingHorizontal: 16,
    },
    message_dotted: {
        borderColor: '#F1F1F1',//需要标色
        borderWidth: 0.5,
    },
    bankImg: {
        width: 12,
        height: 24,
        position: 'absolute',
        right: 18,
    },
    addImg: {
        width: 24,
        height: 24,
        position: 'absolute',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        right: 50,
        top: -3,
    },
    auth_bottom: {
        flexDirection: 'row',
        marginLeft: 40,
        marginTop: 12,
    },
    auth_bottom_wrap: {
        flexDirection: 'column-reverse',
        marginTop: 12,
        marginBottom: 48,
        marginHorizontal: 40,
    },
    user_auth: {
        position: 'absolute',
        flexDirection: 'column-reverse',
        top: 0,
        left: 18,
    },
    user_poli_text: {
        fontSize: 12,
        color: '#F64976',
    },
    // 组件弹窗
    line: {
        height: 60,
    },
    rightStyle: {
        height: 60,
        borderColor: '#f0f0f0',
        borderBottomWidth: getPixel(1),
    },
    label: {
        fontSize: 17,
        color: '#212121',
    },
    extraLabel: {
        fontSize: 17,
    },

})

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 18.5,
        paddingHorizontal: 5,
        color: 'black',
        paddingRight: 60, // to ensure the text is never behind the icon
        marginLeft: 10,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 18.5,
        paddingVertical: 8,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});

const getAvatarInitials = textString => {
    if (!textString) return "";

    const text = textString.trim();

    const textSplit = text.split(" ");

    if (textSplit.length <= 1) return text.charAt(0);

    const initials =
        textSplit[0].charAt(0) + textSplit[textSplit.length - 1].charAt(0);

    return initials;
};


export default connect(({ NSBasic }) => ({ NSBasic }))(ContactScreen);

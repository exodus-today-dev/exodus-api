import * as React from 'react';
import {TagFundsProgressDiagram} from "./TagFundsProgressDiagram";
import {
    getApiKey,
    getCurrencySymbol,
    getLangValue,
    getUserID,
    getUserStatusClassname,
    getUserStatusDescription,
} from '../../global.js';
import {getOnDayOfWeek} from "../../global";
import {Period, Status as UserStatus, TagRole} from '../../enums';
import {bind} from '../../load';
import {observer} from "mobx-react";
import {linkStore} from "../../stores/LinkStore";


const moment = require('moment');


interface Props {
    defaultIntentionOwnerID: Number;
    tagID: Number;
    store: any;
}

interface State {
    tag?: any;
    intentionOwnerFullName: string;
    intentionOwnerAvatar: string;
    intentionOwnerID: number;
    monthIntentionAmount: number;
    monthIntentionCurrency: string;
    curMonthObligationAmount: number;
    userHelpAmountRequired: number;
    userHelpAmountCurrency: number;
    curMonthObligationPercent: Number;
    nextMonthObligationAmount: Number;
    nextMonthObligationPercent: Number;
    userStatus?: UserStatus;
    userLoading: Boolean;
    tagRole: TagRole;
    allowCopyLink: boolean;
    isActive:boolean;
}

@observer
class NavigationZ extends React.Component<Props, State> {
    tagRole: TagRole;
    allowCopyLink: boolean;

    constructor(props: Props) {
        super(props);
        this.state = {
            tag: {},
            intentionOwnerFullName: '',
            intentionOwnerAvatar: '',
            intentionOwnerID: NaN,
            monthIntentionAmount: NaN,
            userHelpAmountRequired: NaN,
            userHelpAmountCurrency: NaN,
            monthIntentionCurrency: '',
            curMonthObligationAmount: NaN,
            curMonthObligationPercent: NaN,
            nextMonthObligationAmount: NaN,
            nextMonthObligationPercent: NaN,
            userStatus: undefined,
            userLoading: true,
            tagRole: TagRole.None,
            allowCopyLink: false,
            isActive:true,
        };
        this.updateTagRoleInfo = this.updateTagRoleInfo.bind(this);
        this.checkIsActive = this.checkIsActive.bind(this);
        window.updateTagRoleInfo = this.updateTagRoleInfo;
    }

    componentDidMount() {
        //const hyperlinkSection = document.querySelector('.hyperlink-section');
        //if (hyperlinkSection) bind(hyperlinkSection);
    }

    componentWillMount() {
        let that = this

        this.props.store.setTag({})

        fetch('/api/User/Get_ByID?UserID=' + this.props.defaultIntentionOwnerID, {credentials: 'include'})
            .then(response => response.json())
            .then((json: any) => {
                if (json.RequestStatus == 200) {

                    let data = json.Data,
                        helpDetail = data.HelpDetail,
                        userHelpAmountRequired = helpDetail.UserHelpAmountRequired,
                        userHelpAmountCurrency = helpDetail.UserHelpAmountCurrency,
                        monthIntentionAmount = 0,
                        monthIntentionCurrency = '',
                        curMonthObligationAmount = 0,
                        curMonthObligationPercent = NaN,
                        nextMonthObligationAmount = NaN,
                        nextMonthObligationPercent = NaN;
                   // console.log("-> helpDetail", data);
                    if (helpDetail.HelpDetailID !== -1) {
                        // TODO: get values for intensions
                        /*
                        monthIntentionAmount = NaN;
                        monthIntentionCurrency = '';
                        curMonthObligationAmount = NaN,
                        curMonthObligationPercent = NaN,
                        nextMonthObligationAmount = NaN,
                        nextMonthObligationPercent = NaN;
                        */
                    }

                    that.setState({
                        intentionOwnerFullName: data.UserFullName,
                        intentionOwnerAvatar: data.AvatarBig,
                        intentionOwnerID: data.UserID,
                        monthIntentionAmount: monthIntentionAmount,
                        monthIntentionCurrency: monthIntentionCurrency,
                        userHelpAmountRequired: userHelpAmountRequired,
                        userHelpAmountCurrency: userHelpAmountCurrency,
                        curMonthObligationAmount: curMonthObligationAmount,
                        curMonthObligationPercent: curMonthObligationPercent,
                        nextMonthObligationAmount: nextMonthObligationAmount,
                        nextMonthObligationPercent: nextMonthObligationPercent,
                        userStatus: data.UserStatus,
                        userLoading: false
                    });
                } else {
                    // handle error from server
                }
            });

        // fetch('/api/Intention/Get_ByTagID?api_key=' + getApiKey() + '&TagID=' + this.props.tagID, {credentials: 'include'})
        //     .then(response => response.json())
        //     .then((json: any) => {
        //         let data = json.Data;
        //     });

        this.updateTagRoleInfo();

        // take tag information
        fetch('/api/Tag/Get_ByID?api_key=' + getApiKey() + '&TagID=' + this.props.tagID, {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                //console.log("-> ", json.Data);
                that.setState({tag: json.Data});
                this.props.store.setTag(json.Data)
            });

    }

    async updateTagRoleInfo() {
        const response = await fetch('/api/Tag/TagRole?TagID=' + this.props.tagID + '&UserID=' + getUserID(), {credentials: 'include'});
        const json = await response.json();
        let tagRole = TagRole.None;

        if (json.ErrorCode == -1) {
            tagRole = json.Data;
            const allowCopyLink = json.Data !== TagRole.None;

            this.setState({
                tagRole: tagRole,
                allowCopyLink: allowCopyLink
            }, () => {
                bind(document.querySelector('#ex-route-1 > div'));  //prevent double load
               // bind(document.getElementById('ex-route-1'));
            });
        }

        return tagRole;
    }



    checkIsActive(){
        const checkEl = document.querySelector('.check');
        if (checkEl && checkEl.classList.contains('active')) {
            this.setState({isActive:true})
        } else {
            this.setState({isActive:false})
        }
    }

    render() {
        let {
            tagRole,
            allowCopyLink,
            userLoading,
            intentionOwnerFullName,
            intentionOwnerAvatar,
            intentionOwnerID,
            userStatus,
            userHelpAmountRequired,
            curMonthObligationAmount,
            monthIntentionAmount,
            userHelpAmountCurrency,
            tag,
        } = this.state;

        let{store}=this.props

        //const isCurUserIntentionOwner=intentionOwnerID===+getUserID()
        const isCurUserIntentionOwner=tagRole===TagRole.Owner

        return (<div onClick={()=>this.checkIsActive()}>
                <div className="ex-navigation__info" data-loading={userLoading}>
                    <div className="ex-navigation__header">
                        <div className="ex-navigation__content">
                            <img src={intentionOwnerAvatar} className="avatar"/>
                            <div
                                className="ex-navigation__title">{intentionOwnerFullName}</div>
                        </div>
                    </div>
                </div>

                <div
                    data-load={"/H2O/AppH2ODefaultPage?TagID=" + this.props.tagID + "&TagRole=" + tagRole}
                    className={"ex-navigation__item ex-navigation__item-status check active " + getUserStatusClassname(userStatus)}
                >
                    <div className="ex-navigation__title"
                         data-load={"/H2O/AppH2ODefaultPage?TagID=" + this.props.tagID + "&TagRole=" + tagRole}
                         data-target="#ex-route-2"
                    >
                        <i className="icons-status-circle ex-navigation__icon"> </i>
                        <p>{getLangValue("Status") + ": " + (getUserStatusDescription(userStatus)).toLowerCase()}</p>
                    </div>
                    {this.state.isActive?
                        <div>
                        <div className="ex-navigation__circle-diagram">
                            <TagFundsProgressDiagram
                                required={userHelpAmountRequired}
                                collected={store.obligationsTotal}
                                expected={store.intentionsTotal}
                                month={moment.months(moment().month())}
                                width={130}
                                userStatus={userStatus}
                            />
                            <div className='diagram-description'>
                                <p className='total'>{getLangValue('Funds.Total')}: <b>{getCurrencySymbol(userHelpAmountCurrency)} {userHelpAmountRequired ? userHelpAmountRequired : '0'}</b>
                                </p>
                                <p className={'collected ' + getUserStatusClassname(userStatus)}>{getLangValue('Funds.Collected')}: <b>{getCurrencySymbol(userHelpAmountCurrency)} {store.obligationsTotal}</b>
                                </p>
                                <p className='expected'>{getLangValue('Funds.Expected')}: <b>{getCurrencySymbol(userHelpAmountCurrency)} {store.intentionsTotal}</b>
                                </p>
                            </div>
                        </div>
                        <div className='ex-navigation__tag-info'>
                            <p className='item'>
                                {
                                    isCurUserIntentionOwner?
                                        <img src="/Styles/dist/images/icons/coin-dark.png" alt="coin"/>
                                        :
                                        <img src="/Styles/dist/images/icons/coin.png" alt="coin"/>
                                }
                                {`${getLangValue("MinIntention")} `}
                                {getCurrencySymbol(tag.MinIntentionCurrencyID)}
                                {` ${tag.MinIntentionAmount ? tag.MinIntentionAmount : '0'}`}
                            </p>
                            <p className='item'>
                                {
                                    isCurUserIntentionOwner?
                                        <img src="/Styles/dist/images/icons/waiting-dark.png" alt="waiting"/>
                                        :
                                        <img src="/Styles/dist/images/icons/waiting.png" alt="waiting"/>
                                }
                                {tag.Period === Period.Monthly &&
                                <span>
                                    {` ${getLangValue('Regularly')}`},
                                    {` ${tag.DayOfMonth} `}
                                    {getLangValue('DayOfEveryMonth').toLowerCase()}
                                </span>
                                }
                                {tag.Period === Period.Weekly &&
                                <span>
                                    {` ${getLangValue('Regularly')}`},
                                    {` ${getOnDayOfWeek(tag.DayOfWeek)} `.toLowerCase()}
                                </span>
                                }
                                {tag.Period === Period.Once &&
                                <span>
                                    {` ${getLangValue('Period.Once')}`}
                                </span>
                                }
                                {tag.Period === Period.Undefined &&
                                <span>
                                    {` ${getLangValue('Unset')}`}
                                </span>
                                }
                            </p>
                            <p className='item hyperlink-section'>
                                {
                                    isCurUserIntentionOwner?
                                        <img src="/Styles/dist/images/icons/hyperlink-dark.png" alt="hyperlink"/>
                                        :
                                        <img src="/Styles/dist/images/icons/hyperlink.png" alt="hyperlink"/>
                                }
                                {/*<a href={`${window.location.origin}/user?${tag.Owner_UserID ? tag.Owner_UserID : ''}`}>*/}
                                {/*    {`${window.location.origin}/user?${tag.Owner_UserID ? tag.Owner_UserID : ''}`}*/}
                                {/*</a>*/}
                                <span className='copy-invite' id="LinkButton">{getLangValue("CopyLinkToInvite")}</span>
                                <span className='hidden' id="linkToJoin">{this.state.tag.LinkToJoin}</span>
                            </p>

                        </div>
                    </div>
                        :
                        null}

                </div>

                <div className="ex-navigation__item"
                     data-load={"/H2O/UserList?TagID=" + this.props.tagID}
                     data-target="#ex-route-2">
                    <div className="ex-navigation__title status-free">
                        {
                            isCurUserIntentionOwner?
                                <img src="/Styles/dist/images/icons/relationship-dark.png" alt="relationship"/>
                                :
                                <img src="/Styles/dist/images/icons/relationship.png" alt="relationship"/>
                        }
                        <p>{getLangValue("UserInitiatives")}</p>
                    </div>
                </div>



                {/*<div className="ex-navigation__item"*/}
                {/*     data-load={"/H2O/UserList?TagID=" + this.props.tagID}*/}
                {/*     data-target="#ex-route-2">*/}
                {/*    <div className="ex-navigation__title">*/}
                {/*        <i className="icons-person ex-navigation__icon"></i>*/}
                {/*        <p>{getLangValue("Members")}</p>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div className="ex-navigation__item"*/}
                {/*     hidden={tagRole == TagRole.None}*/}
                {/*     data-load={"/H2O/InviteMembers?TagID=" + this.props.tagID}*/}
                {/*     data-target="#ex-route-2">*/}
                {/*    <div className="ex-navigation__title">*/}
                {/*        <i className="icons-person ex-navigation__icon"></i>*/}
                {/*        <p>{getLangValue("InviteMembers")}</p>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/*<div className="ex-navigation__item"*/}
                {/*     data-load={"/Tag/TagInfo?TagID=" + this.props.tagID + "&AllowCopyLink=" + allowCopyLink}*/}
                {/*     data-target="#ex-route-2">*/}
                {/*    <div className="ex-navigation__title">*/}
                {/*        <i className="icons-info ex-navigation__icon"></i>*/}
                {/*        <p>{getLangValue("TagInfo")}</p>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className="ex-navigation__item"
                    data-load={"/Tag/PaymentDetails?TagID=" + this.props.tagID}
                    data-target="#ex-route-2">
                    <div className="ex-navigation__title status-free">
                        {
                            isCurUserIntentionOwner?
                                <img src="/Styles/dist/images/icons/credit-card-dark.png" alt="credit-card"/>
                                :
                                <img src="/Styles/dist/images/icons/credit-card.png" alt="credit-card"/>
                        }

                        <p>{getLangValue("PaymentDetails")}</p>
                    </div>
                </div>

                {/*
            <div className="ex-navigation__share">
                <div className="ex-navigation__share-title">{getLangValue("Share")}</div>
                <div className="ex-navigation__share-links">
                    <a href="#"><img src="/Styles/dist/images/icons/vk.png" /></a>
                    <a href="#"><img src="/Styles/dist/images/icons/fb.png" /></a>
                    <a href="#"><img src="/Styles/dist/images/icons/in.png" /></a>
                </div>
            </div>
            */}

            </div>
        )
    }
}

export class Navigation extends React.Component<Props, State> {
    render() {
        return (
            <NavigationZ
                tagID={this.props.tagID}
                defaultIntentionOwnerID={this.props.defaultIntentionOwnerID}
                store={linkStore}
            />

        )
    }
}

import * as React from 'react';
import {getApiKey, getLangValue, getUserID} from '../../global.js';
import {bind} from '../../load';
import {Application, IntentionType, TagRole, Period, AccessType, Status} from '../../enums';
import {TagFundsProgressDiagram} from "../H20/TagFundsProgressDiagram";
import {getCurrencySymbol, getOnDayOfWeek, getUserStatusClassname} from "../../global";
import {linkStore} from "../../stores/LinkStore";
import {inject, observer, Provider} from "mobx-react";
import {spawn} from "child_process";
import {log} from "util";

interface Props {
    tagID: Number;
    tagName: string;
    store: any;
}

interface State {
    tagRole: TagRole
    allowCopyLink: boolean
    loading: boolean,
    intentions: any[],
    obligations: any[],
    intentionType: IntentionType,
    tag: any,
    fundsCollected: number,
    fundsExpected: number,
}

declare global {
    interface Window {
        updateTagRoleInfo: Function;
    }
}

//@inject('store')
@observer
class NavigationN extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            tagRole: TagRole.None,
            allowCopyLink: false,
            tag: null,
            intentions: [],
            obligations: [],
            intentionType: IntentionType.None,
            loading: false,
            fundsCollected: 0,
            fundsExpected: 0,
        };
        this.updateTagRoleInfo = this.updateTagRoleInfo.bind(this);
        window.updateTagRoleInfo = this.updateTagRoleInfo;
        this.getDaysToEnd = this.getDaysToEnd.bind(this);
        this.getLastDayOfCurrentMonth = this.getLastDayOfCurrentMonth.bind(this)
    }

    async componentWillMount() {
        await this.updateTagRoleInfo();

        this.props.store.setTag({})

        let that = this;

        // take tag information
        fetch('/api/Tag/Get_ByID?api_key=' + getApiKey() + '&TagID=' + this.props.tagID, {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                //   console.log('-----------------', json.Data);
                that.setState({tag: json.Data});
                this.props.store.setTag(json.Data)
            });

        // this.getIntentionsInfo();
        //
        // // take tag information
        // fetch('/api/Application/Settings_Read?TagID=' + this.props.tagID + '&ApplicationID=' + Application.OwnInitiative, {
        //     credentials: 'include',
        //     method: 'POST'
        // })
        //     .then(response => response.json())
        //     .then(json => {
        //         let intentionType = json.Data ? json.Data.Intention_Type : IntentionType.Regular;
        //         that.setState({intentionType: intentionType == IntentionType.None || intentionType == IntentionType.Regular ? IntentionType.Regular : IntentionType.OnDemand});
        //     });
    }

    // getIntentionsInfo() {
    //     let that = this;
    //     // check if user joined application
    //     if (this.state.tagRole != TagRole.None) {
    //         fetch('/api/Intention/Get_ByTagID?api_key=' + getApiKey() + '&TagID=' + this.props.tagID, {credentials: 'include'})
    //             .then(response => response.json())
    //             .then(json => {
    //                 let intentions = json.Data,
    //                     grandTotalAmount = 0;
    //                 intentions.forEach((item: any) => {
    //                     grandTotalAmount += item.IntentionAmount;
    //                 });
    //                 that.setState({intentions: intentions, fundsExpected: grandTotalAmount, loading: false});
    //             });
    //
    //         fetch('/api/Obligation/Get_ByTagID?api_key=' + getApiKey() + '&TagID=' + this.props.tagID, {credentials: 'include'})
    //             .then(response => response.json())
    //             .then(json => {
    //                 let obligations = json.Data,
    //                     grandTotalAmount = 0;
    //
    //                 obligations.forEach((item: any) => {
    //                     grandTotalAmount += item.AmountTotal;
    //                 });
    //                 that.setState({obligations: obligations, fundsCollected: grandTotalAmount});
    //             });
    //     }
    //
    // }

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
                bind(document.getElementById('ex-screen-1'));

                const tagInviteWrapper = document.querySelector('.tag-invite-members-container_wrapper');
                if (tagInviteWrapper) bind(tagInviteWrapper);
            });
        }

         return tagRole;
    }


    // async componentDidUpdate() {
    //     // if (this.props.store.refreshData) {
    //     //     console.log('GET REFRESH',this.props.store.intentionsTotal, this.props.store.obligationsTotal)
    //     //     this.props.store.setRefreshData(false)
    //         this.setState({
    //             fundsExpected: this.props.store.intentionsTotal,
    //             fundsCollected: this.props.store.obligationsTotal
    //         })
    //        // await this.updateTagRoleInfo();
    //        // this.getIntentionsInfo();
    //     //     console.log('REFRESH DONE')
    //     // console.log('this.props.store.refreshData',this.props.store.refreshData)
    //     //
    //     // }
    // }


    getLastDayOfCurrentMonth() {
        const month = new Date().getMonth()
        const year = new Date().getFullYear()
        let date = new Date(year, month + 1, 0);
        return date.getDate();
    }

    getDaysToEnd() {
        const {tag} = this.state
        const date = new Date()
        if (tag && tag.Period === Period.Once) {
            const startDate = tag ? Date.parse(tag.Created) : 1
            const endDate = tag ? Date.parse(tag.EndDate) : 1
            return {
                left: Math.ceil(Math.abs(endDate - +date) / (1000 * 3600 * 24)),
                all: Math.ceil(Math.abs(endDate - startDate) / (1000 * 3600 * 24))
            }
        }
        if (tag && tag.Period === Period.Monthly) {
            const dayOfMonth = tag ? tag.DayOfMonth : 1
            return date.getDate() > dayOfMonth ?
                {
                    left: this.getLastDayOfCurrentMonth() - date.getDate() + dayOfMonth,
                    all: 30
                }
                :
                {
                    left: dayOfMonth - date.getDate(),
                    all: 30
                }
        }
        if (tag && tag.Period === Period.Weekly) {
            const dayOfWeek = tag ? tag.DayOfWeek : 1
            return date.getDay() > dayOfWeek ?
                {
                    left: 7 - date.getDay() + dayOfWeek,
                    all: 7
                }
                :
                {
                    left: dayOfWeek - date.getDay(),
                    all: 7
                }
        }
        return {
            left: 0,
            all: 0
        }
    }

    getEndDate(left = 0) {
        const date = new Date()
        const endDate = +date + left * 3600 * 24000
        return {
            date: new Date(endDate).getDate(),
            month: new Date(endDate).getMonth(),
            year: new Date(endDate).getFullYear()
        }
    }

    render() {
        // console.log(this.getLastDayOfCurrentMonth())
        let {tagRole, allowCopyLink, tag, intentions, intentionType, loading, obligations, fundsCollected, fundsExpected} = this.state;
        let {store} = this.props
        //  console.log(tag, tag?.TotalAmount, fundsCollected, fundsExpected, '---', tagRole)
        const accessType = tag ? tag.AccessType : 1
        const ownerFirstName = tag ? tag.OwnerFirstName.charAt(0).toUpperCase() + tag.OwnerFirstName.slice(1) : ''
        const ownerLastName = tag ? tag.OwnerLastName.charAt(0).toUpperCase() + tag.OwnerLastName.slice(1) : ''
        const status=tag ? tag.DefaultIntentionOwner.UserStatus : null

        return (<div className='ex-navigation__own-initiative'>

                <div className="ex-navigation__info">
                    {/*{this.props.store.refreshData ? <span>+++</span> : <span>---</span>}*/}
                    <div className="ex-navigation__circle-diagram">
                        <TagFundsProgressDiagram
                            required={tag ? tag.TotalAmount : 0}
                            collected={store.obligationsTotal}
                            expected={store.intentionsTotal}
                            width={160}
                            userStatus={tag ? tag.DefaultIntentionOwner.UserStatus : null}
                            avatar={tag ? tag.DefaultIntentionOwner.AvatarSmall : null}

                        />
                    </div>
                    <div className="ex-navigation__title">
                        <h4>{tag ? tag.Name : null}</h4>
                        <p>{tag ? tag.Description : null}</p></div>

                </div>
                <div className="ex-navigation__item active"
                     data-load={"/OwnInitiative/Dashboard?TagID=" + this.props.tagID + "&TagRole=" + tagRole}
                     data-target="#ex-route-2">
                    <p className='total-mine'>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/coins_black.png" alt="coins"/>
                                :
                                <img src="/Styles/dist/images/icons/coins.png" alt="coins"/>
                        }
                        <>{getLangValue('TotalAmount')}:&nbsp;<b>{getCurrencySymbol(tag ? tag.TotalAmountCurrencyID : '')} {tag ? tag.TotalAmount : '0'}</b>
                        </>
                    </p>
                    <p className='expected-mine'>
                        {Status.OK == status
                            && <img src="/Styles/dist/images/icons/hand.png" alt="hand"/>}
                        {Status.RegularHelp == status
                            && <img src="/Styles/dist/images/icons/hand_orange.png"
                                    style={{width:'25px'}}
                                    alt="hand"/>}
                        {Status.Emergency == status
                            && <img src="/Styles/dist/images/icons/hand_red.png"
                                    style={{width:'25px'}}
                                    alt="hand"/>}
                        {/*{console.log(Status.RegularHelp == tag ? tag.DefaultIntentionOwner.UserStatus : null)}*/}

                        <span> {getLangValue('Funds.Expected')}:&nbsp;<b>{getCurrencySymbol(tag ? tag.TagCurrency : '')} {store.intentionsTotal}</b>{' / '}
                            <span className={getUserStatusClassname(tag ? tag.DefaultIntentionOwner.UserStatus : 1)}>
                            {getLangValue('Funds.Collected')}:&nbsp;
                            <b>{getCurrencySymbol(tag ? tag.TagCurrency : '')} {store.obligationsTotal}</b>
                            </span>
                        </span>
                    </p>
                    <p className='left-mine'>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/wall-clock_black.png" alt="clock"/>
                                :
                                <img src="/Styles/dist/images/icons/wall-clock.png" alt="clock"/>
                        }
                        <span> {`${getLangValue('Funds.Left')}: `}
                            <b className='total-mine'>{this.getDaysToEnd().left}</b>
                            {` / ${this.getDaysToEnd().all} ${getLangValue('Date.5+Days')}`}
                        </span>
                    </p>

                    {/*<p className={'collected ' + getUserStatusClassname(userStatus)}>{getLangValue('Funds.Collected')}: <b>{getCurrencySymbol(userHelpAmountCurrency)} {curMonthObligationAmount ? curMonthObligationAmount : '0'}</b>*/}
                    {/*</p>*/}
                    {/*<p className='expected'>{getLangValue('Funds.Expected')}: <b>{getCurrencySymbol(userHelpAmountCurrency)} {monthIntentionAmount ? monthIntentionAmount : '0'}</b>*/}
                    {/*</p>*/}
                    {/*{getLangValue("Dashboard")}*/}
                    {/*<i className="icons-statistic ex-navigation__icon"></i>*/}
                </div>

                <div className='own-info'>
                    <p>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/coin_black.png" alt="coin"/>
                                :
                                <img src="/Styles/dist/images/icons/coin.png" alt="coin"/>
                        }
                        <> {`${getLangValue("MinIntention")} `}
                            {getCurrencySymbol(tag ? tag.MinIntentionCurrencyID : '')}
                            {` ${tag ? tag.MinIntentionAmount : '0'}`}
                        </>
                    </p>
                    <p>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/waiting_black.png" alt="waiting"/>
                                :
                                <img src="/Styles/dist/images/icons/waiting.png" alt="waiting"/>
                        }
                        <>  {`${getLangValue("EndDate")} 
                    ${this.getEndDate(this.getDaysToEnd().left).date < 10 ?
                            '0' + this.getEndDate(this.getDaysToEnd().left).date
                            :
                            this.getEndDate(this.getDaysToEnd().left).date
                        }:${(this.getEndDate(this.getDaysToEnd().left).month + 1) < 10 ?
                            '0' + (this.getEndDate(this.getDaysToEnd().left).month + 1)
                            :
                            this.getEndDate(this.getDaysToEnd().left).month + 1
                        }:${this.getEndDate(this.getDaysToEnd().left).year}`}
                        </>
                    </p>
                    <p>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/hyperlink_black.png" alt="hyperlink"/>
                                :
                                <img src="/Styles/dist/images/icons/hyperlink.png" alt="hyperlink"/>
                        }
                        <> <a href={tag ? tag.LinkToJoin : ''}>
                            {tag ? tag.LinkToJoin : ''}
                        </a>
                        </>
                    </p>
                    <p>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/user_black.png" alt="person"/>
                                :
                                <img src="/Styles/dist/images/icons/person-light.png" alt="person"/>
                        }
                        <> {
                            accessType === AccessType.Public ?
                                getLangValue("Public")
                                :
                                getLangValue("Private")
                        }
                            {
                                ' ' + getLangValue("Tag").toLowerCase() + ', '
                                + getLangValue('Creator').toLowerCase() + ': ' +
                                ownerFirstName + ' ' + ownerLastName
                            }
                        </>
                    </p>
                    <p className='share'>
                        {
                            tagRole === TagRole.Owner ?
                                <img src="/Styles/dist/images/icons/share_black.png" alt="share"/>
                                :
                                <img src="/Styles/dist/images/icons/share.png" alt="share"/>
                        }
                        <> {
                            getLangValue("Share") + ':'
                        }
                            <a href="#0"><img src="/Styles/dist/images/icons/vk.png" alt="vk"/></a>
                            <a href="#0"><img src="/Styles/dist/images/icons/fb.png" alt="fb"/></a>
                            <a href="#0"><img src="/Styles/dist/images/icons/in.png" alt="in"/></a>
                        </>
                    </p>
                </div>

                {/*<div className="ex-navigation__item"*/}
                {/*     data-load={"/OwnInitiative/UserList?TagID=" + this.props.tagID}*/}
                {/*     data-target="#ex-route-2">*/}

                {/*    {getLangValue("Members")}*/}
                {/*    <i className="icons-person ex-navigation__icon"></i>*/}
                {/*</div>*/}

                {/*<div className="ex-navigation__item" hidden={tagRole !== TagRole.Owner}*/}
                {/*     data-load={"/OwnInitiative/Settings?TagID=" + this.props.tagID}*/}
                {/*     data-target="#ex-route-2">*/}
                {/*    {getLangValue("Settings")}*/}
                {/*    <i className="icons-gear ex-navigation__icon"></i>*/}
                {/*</div>*/}

                {/*<div className="ex-navigation__item" hidden={tagRole == TagRole.None}*/}
                {/*     data-load={"/OwnInitiative/InviteMembers?TagID=" + this.props.tagID}*/}
                {/*     data-target="#ex-route-2">*/}
                {/*    {getLangValue("InviteMembers")}*/}
                {/*    <i className="icons-person ex-navigation__icon"></i>*/}
                {/*</div>*/}

                {/*<div className="ex-navigation__item"*/}
                {/*     data-load={"/Tag/TagInfo?TagID=" + this.props.tagID + "&AllowCopyLink=" + allowCopyLink}*/}
                {/*     data-target="#ex-route-2">*/}

                {/*    {getLangValue("TagInfo")}*/}
                {/*    <i className="icons-info ex-navigation__icon"></i>*/}
                {/*</div>*/}

                {/*<div className="ex-navigation__item"></div>*/}
            </div>
        )
    }
}

export class Navigation extends React.Component<Props, State> {
    render() {
        return (
            // <Provider store={linkStore}>
            <NavigationN
                tagID={this.props.tagID}
                tagName={this.props.tagName}
                store={linkStore}
            />
            //   </Provider>
        )
    }
}

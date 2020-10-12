import * as React from "react";
import {getUserID, getLangValue, getCurrencySymbol, getUserStatusClassname} from "../../global";


interface Props {
    intentions: any[],
    obligations: any[],
    isIntentionsData: boolean,
    isObligationsData: boolean,
    tag: {
        DefaultIntentionOwner: { UserStatus: number },
    },
   // updateFundsInfo(): any,

    obligationDelete(ObligationID: number): any,

    intentionDelete(IntentionID: number): any,

    convertIntentionToObligation(IntentionID: number): any,
}

export class TagMembersTable extends React.Component<Props> {
    curUserID: number;

    constructor(props: any) {
        super(props);
        this.curUserID = +getUserID();
    }

    // async onConvertClick(ID: number) {
    //     await this.props.convertIntentionToObligation(ID);
    //     await this.props.updateFundsInfo()
    // }
    //
    // async onDeleteIntentionClick(ID: number) {
    //     await this.props.intentionDelete(ID)
    //     await this.props.updateFundsInfo()
    // }
    //
    // async onDeleteObligationClick(ID: number) {
    //     await this.props.obligationDelete(ID);
    //     await this.props.updateFundsInfo()
    // }

    render() {
        let {intentions, obligations, isIntentionsData, isObligationsData} = this.props
        let tagMembersWithIntention = intentions.map((intention) => {
            return {
                userID: intention.IntentionIssuer.UserID,
                name: intention.IntentionIssuer.UserFirstName[0].toUpperCase() + intention.IntentionIssuer.UserFirstName.slice(1),
                surname: intention.IntentionIssuer.UserLastName[0].toUpperCase() + intention.IntentionIssuer.UserLastName.slice(1),
                intentionAmount: intention.IntentionAmount,
                intentionID: intention.IntentionID,
                obligationAmount: null,
                obligationID: null,
                date: intention.IntentionStartDate,
                avatar: intention.IntentionIssuer.AvatarSmall,
                currency: intention.CurrencyID,
                isActive: true,
            }
        })
        let tagMembersWithObligation = obligations.map((obligation) => {
            return {
                userID: obligation.ObligationIssuerID,
                name: obligation.ObligationIssuerFirstName[0].toUpperCase() + obligation.ObligationIssuerFirstName.slice(1),
                surname: obligation.ObligationIssuerLastName[0].toUpperCase() + obligation.ObligationIssuerLastName.slice(1),
                intentionAmount: null,
                intentionID: obligation.IntentionID,
                obligationAmount: obligation.AmountTotal,
                obligationID: obligation.ObligationID,
                date: obligation.ObligationDate,
                avatar: obligation.ObligationIssuerAvatarSmall,
                currency: obligation.ObligationCurrency,
                isActive: obligation.IsActive,
            }
        })

        let tagMembers = tagMembersWithObligation.concat(tagMembersWithIntention);
        tagMembers.sort((a, b) => {
                if (a.userID == this.curUserID && b.userID != this.curUserID) return -1;
                if (a.userID != this.curUserID && b.userID == this.curUserID) return 1;
                return 0;
            }
        );


        let tagMembersTable = tagMembers.map((tagMember, index) => {
                if (tagMember.isActive) return (
                    <tr key={'a' + tagMember.userID + index}
                        className={tagMember.userID == this.curUserID ?
                            `tag-member my-intention ${getUserStatusClassname(
                                Object.keys(this.props.tag).length > 0 ?
                                    this.props.tag.DefaultIntentionOwner.UserStatus : 1)}`
                            :
                            `tag-member ${getUserStatusClassname(
                                Object.keys(this.props.tag).length > 0 ?
                                    this.props.tag.DefaultIntentionOwner.UserStatus : 1)}`}>
                        <td key={`${'a' + tagMember.userID + index}0`}
                            className='member-avatar'>
                            <img
                                src={tagMember.avatar}
                                alt="img"/>
                        </td>
                        <td key={`${'a' + tagMember.userID + index}1`}
                            className='member-name'>
                            <span>{tagMember.name}</span><br/>
                            <span>{tagMember.surname}</span>
                            {/*tagMember.userID == this.curUserID ?
                                <span> ({getLangValue("IAm").toLowerCase()})</span> : null*/}
                        </td>
                        <td key={`${'a' + tagMember.userID + index}2`}
                            className='member-intention'
                        >
                            {tagMember.intentionAmount ?
                                <div className='colored-back'>
                            <span className='colored-amount'>{getCurrencySymbol(tagMember.currency)}
                                {tagMember.intentionAmount}</span>
                                </div> :
                                tagMember.userID == this.curUserID ?
                                    <span className='notification'>
                                {getLangValue("Notification.IntentionConvertedToObligation")}
                            </span>
                                    :
                                    null
                            }
                        </td>
                        <td key={`${'a' + tagMember.userID + index}3`}
                            className='member-intention'
                        >
                            {tagMember.obligationAmount ?
                                <div className='colored-back'>
                            <span className='colored-amount'>{getCurrencySymbol(tagMember.currency)}
                                {tagMember.obligationAmount}</span>
                                </div> :
                                tagMember.userID == this.curUserID ?
                                    <button className='convert btn btn-link'
                                            onClick={() =>
                                                this.props.convertIntentionToObligation(tagMember.intentionID)}
                                    >
                                        {getLangValue("ConvertToObligation")}
                                    </button>
                                    :
                                    null
                            }

                        </td>
                        {tagMember.userID == this.curUserID ?
                            <td key={`${'a' + tagMember.userID + index}4`}
                                className='delete-basket'>
                                <button
                                    className='btn btn-link'
                                    onClick={
                                        () => {
                                            tagMember.obligationID ?
                                                this.props.obligationDelete(tagMember.obligationID)
                                                :
                                                this.props.intentionDelete(tagMember.intentionID)

                                        }
                                    }
                                >
                                    <img
                                        src="/Styles/dist/images/icons/deleteBasket.png"
                                        alt="basket"/>
                                </button>
                            </td>
                            :
                            <td key={`${'a' + tagMember.userID + index}4`}
                                className='delete-basket'>
                            </td>
                        }

                    </tr>)
                return null
            }
        )
        return (
            isIntentionsData && isObligationsData && <table className='tag-members-table'>
                <thead>
                <tr key='header' className='tab-header'>
                    <th key='header1' className='tab-header_icon'><i
                        className="icons-two-persons"> </i></th>
                    <th key='header2'>{getLangValue("Members")}:</th>
                    <th key='header3'>{getLangValue("Intentions")}:</th>
                    <th key='header4'>{getLangValue("Obligations")}:</th>
                    <th key='header5'></th>
                </tr>
                </thead>
                <tbody>
                {tagMembersTable}
                </tbody>
            </table>
        )
    }
}


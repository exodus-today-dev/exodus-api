import * as React from "react";
import {getLangValue, getCurrencySymbol, getUserID, getUserStatusClassname} from "../../global";

interface Props {
    intentions: any[],
    obligations: any[],
    isIntentionsData: boolean,
    isObligationsData: boolean,
    tag: {
        DefaultIntentionOwner: {
            AvatarSmall: string,
            UserStatus: number
        },
        OwnerFirstName: string,
        OwnerLastName: string,
        TotalAmountCurrencyID: number,
    },

}

export class TagTotalTable extends React.Component<Props> {

    render() {
        let {intentions, obligations, tag, isIntentionsData, isObligationsData} = this.props;
        let totalTagIntentions = intentions.reduce((sum, intention) => sum + intention.IntentionAmount, 0);
        let totalTagObligations = obligations.reduce((sum, obligation) => sum + obligation.AmountTotal, 0);

        return (
            isIntentionsData && isObligationsData &&   <table className='tag-members-table'>
                <thead>
                <tr key='header' className='tab-header'>
                    <th key='header1' className='tab-header_icon'>
                        <img src="/Styles/dist/images/icons/arrow-down.svg" alt="arrow-down"/>
                    </th>
                    <th key='header2'>{getLangValue("ForUser")}:</th>
                    <th key='header3'>{getLangValue("Funds.TotalIntentions")}:</th>
                    <th key='header4'>{getLangValue("Funds.TotalObligations")}:</th>
                    <th key='header5'></th>
                </tr>
                </thead>
                <tbody>
                <tr key='total'
                    className={`tag-member ${getUserStatusClassname(this.props.tag.DefaultIntentionOwner.UserStatus)}`}>
                    <td key='owner-avatar'
                        className='member-avatar'>
                        <img
                            src={tag.DefaultIntentionOwner.AvatarSmall}
                            alt="img"/>
                    </td>
                    <td key='owner-name'
                        className='member-name'>
                        <span>{tag.OwnerFirstName ? tag.OwnerFirstName[0].toUpperCase() + tag.OwnerFirstName.slice(1) : null}</span><br/>
                        <span>{tag.OwnerLastName ? tag.OwnerLastName[0].toUpperCase() + tag.OwnerLastName.slice(1) : null}</span>
                    </td>
                    <td key='total-intentions'
                        className='member-intention'
                    >
                        {totalTagIntentions ?
                            <div>
                            <span className='colored-amount'>{getCurrencySymbol(tag.TotalAmountCurrencyID)}
                                {totalTagIntentions}</span>
                            </div> :
                            null
                        }
                    </td>
                    <td key='total-obligations'
                        className='member-intention'
                    >
                        {totalTagObligations ?
                            <div className='back'>
                            <span>{getCurrencySymbol(tag.TotalAmountCurrencyID)}
                                {totalTagObligations}</span>
                            </div> :
                            null
                        }
                    </td>
                    <td key='empty'
                        className='delete-basket'>

                    </td>
                </tr>
                </tbody>
            </table>
        )
    }
}


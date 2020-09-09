import * as React from 'react';
import {PaymentAccountNew} from './PaymentAccountNew'
import {PaymentAccountStore} from '../../stores/PaymentAccountStore'
import {PaymentAccountEdit} from './PaymentAccountEdit'
import {getApiKey, getUserID} from '../../global';

interface Props {
    editable: boolean;
    UserID: string
}

interface State {
    paymentAccountList: PaymentAccountStore[]
}

export class PaymentAccountList extends React.Component<Props, State> {
    editEnabled: boolean;

    static defaultProps = {
        editable: true,
        UserID: getUserID()
    }

    constructor(props: Props) {
        super(props);
        this.loadData = this.loadData.bind(this);
        // cheat-fix: in case of rendering with data-react all properties are strings, so props.editable="false", not boolean
        this.editEnabled = typeof props.editable !== "undefined" && (props.editable === false || props.editable.toString() === "false") ? false : true;
    }

    componentWillMount() {
        this.loadData();
    }

    loadData = () => {
        this.setState({paymentAccountList: []});
        fetch('/api/PaymentAccount/Get_list?UserID=' + this.props.UserID, {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                this.setState({paymentAccountList: json.Data.PaymentAccounts.map((item: any) => new PaymentAccountStore(item))});
            })
        //.then(_=>console.log('PaymentAccountList'+this.state.paymentAccountList))
    }

    render() {
        const {editable} = this.props
        if (this.state === null) return <div><img src="styles/dist/images/loading.svg" alt=""/></div>
        const {paymentAccountList} = this.state;
        return (
            this.editEnabled ?
                <div>   {/*update={()=>{this.handleUpdate()}}*/}
                    {
                        paymentAccountList.map(
                            item => {
                                return <PaymentAccountEdit
                                    editable={true}
                                    key={item.AccountID.toString()}
                                    PaymentsAccounts={item}
                                    update={this.loadData}/>
                            })}
                    <PaymentAccountNew update={this.loadData}/>
                </div>
                :
                <div>
                    {
                        paymentAccountList.map(
                            item => {
                                return <PaymentAccountEdit
                                    editable={false}
                                    key={item.AccountID.toString()}
                                    PaymentsAccounts={item}
                                    update={this.loadData}/>
                            })}
                </div>
        )
    }
}

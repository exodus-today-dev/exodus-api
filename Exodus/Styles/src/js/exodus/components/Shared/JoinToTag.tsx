import * as React from 'react';
import {Currency, Period, ObligationType, Application, Term} from '../../enums';
import {getCurrencySymbol, getLangValue, getUserID} from '../../global';
import {FormWithConstraints, FieldFeedbacks, FieldFeedback} from 'react-form-with-constraints-bootstrap4';
import {notify} from '../../components/Shared/Notifications';
import * as moment from 'moment';
import {UserStore} from "../../stores/UserStore";
import {bindToElement} from "../../load";


interface Props {
    tag: any,
    afterSubmitHandler: Function
}

interface State {
    intentionAmount: number,
    //intentionCurrencyID: number,
    loading: boolean,
    user: UserStore;
}

export class JoinToTag extends React.Component<Props, State> {
    form: FormWithConstraints;
    userID: number;

    constructor(props: Props) {
        super(props);

        //   let tag = props.tag;

        //   this.userID = tag.Owner_UserID;

        this.state = {
            intentionAmount: Object.keys(this.props.tag).length > 0 ? this.props.tag.MinIntentionAmount : 0,
            loading: false,
            user: new UserStore({})
        };

        this.buttonClick = this.buttonClick.bind(this);
        this.onIntentionAmountChange = this.onIntentionAmountChange.bind(this);
    }

    componentWillMount() {
        fetch(`/api/User/Current?UserID=` + getUserID(), {credentials: 'include'})
            .then(response => response.json())
            .then(json => {
                this.setState({user: new UserStore(json.Data)})
            })
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
        if (!prevProps.tag.hasOwnProperty('MinIntentionAmount')
            && this.props.tag.hasOwnProperty('MinIntentionAmount'))
            this.setState({intentionAmount: this.props.tag.MinIntentionAmount})
    }

    onIntentionAmountChange = (evt: any) => {
        this.form.validateFields();

        this.setState({
            intentionAmount: evt.target.value,
        });
    }

    submitHandle = (evt: any) => {
        evt.preventDefault();
    }

    buttonClick = async (event: any) => {
        await this.form.validateFields();
        let formIsValid = this.form.isValid();
        if (formIsValid === true) {

            this.setState({loading: true});

            fetch("/api/Intention/Add",
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    method: "post",
                    body:
                        JSON.stringify({
                            "Period": Period.Monthly,
                            "IssuerUserID": getUserID(),
                            "HolderUserID": this.props.tag.DefaultIntentionOwner.UserID,
                            "TagID": this.props.tag.TagID,
                            "IntentionAmount": this.state.intentionAmount,
                            "IntentionTerm": Term.UserDefined,
                            "IntentionDurationMonths": 1,
                            "CurrencyID": this.props.tag.MinIntentionCurrencyID,
                            "ApplicationID": this.props.tag.ApplicationID,
                            "IntentionStartDate": moment().format('YYYY-MM-DD hh:mm:ss'),
                            "IntentionEndDate": moment().add(1, 'month').format('YYYY-MM-DD hh:mm:ss'),

                            // default values
                            "ObligationTypeID": 1,
                            "ObligationKindID": 1,
                            "IntentionIsActive": true,
                            "IntentionDayOfWeek": 1,
                            "IntentionDayOfMonth": 1,
                            "IntentionMemo": ""
                        }),
                    credentials: 'include'
                })
                .then(res => {
                    this.setState({loading: false});

                    if (res.ok) {
                        // show intention created notification
                        notify.success(getLangValue("Notification.IntentionAddedToApplication"));

                        let callback = this.props.afterSubmitHandler;

                        if (typeof callback === 'function') {
                            callback();
                        }
                    } else {
                        //TODO: show error notification
                        notify.error(getLangValue('Error'))

                    }
                });
        }
    }

    render() {
        const {intentionAmount, loading} = this.state;
        const {tag} = this.props;
        // console.log('tag--->>>',tag.MinIntentionAmount)

        return <FormWithConstraints
            //className="create-intention-form"
            onSubmit={this.submitHandle}
            ref={(formWithConstraints: any) => this.form = formWithConstraints} noValidate
            data-loading={loading}>

            <div className="join-to-tag">
                <img src={this.state.user.AvatarSmall} alt='user'/>
                <div>
                    <span>{this.state.user.UserFirstName}</span>
                    <br/>
                    <span>{this.state.user.UserLastName}</span>
                </div>


                <div className="input-wrapper">
                    <label>{getLangValue("YourIntentionToParticipate")}:</label>
                    <span>{getCurrencySymbol(tag.MinIntentionCurrencyID)}</span>
                    <input type="number" className="form-control" id="IntentionAmount" name="IntentionAmount"
                           value={intentionAmount}
                           min={tag.MinIntentionAmount}
                           step='1'
                           pattern="\d+(\,\d{2})?"
                           onChange={this.onIntentionAmountChange}/>

                    <FieldFeedbacks for="IntentionAmount" stop="first">
                        <FieldFeedback when="rangeUnderflow"/>
                    </FieldFeedbacks>


                </div>
                <button className="btn"
                        onClick={this.buttonClick}>{getLangValue("Support")}
                </button>

                {/*<div className="col-md-3">*/}
                {/*    <select className="form-control" name="IntentionCurrencyID" value={intentionCurrencyID} disabled>*/}
                {/*        <option value={Currency.USD}>{getLangValue("Dollars")}</option>*/}
                {/*        <option value={Currency.UAH}>{getLangValue("Hryvnia")}</option>*/}
                {/*        <option disabled value={Currency.RUB} style={{color: '#ccc'}}>{getLangValue("Rubles")}</option>*/}
                {/*        <option disabled value={Currency.EUR} style={{color: '#ccc'}}>{getLangValue("Euro")}</option>*/}
                {/*    </select>*/}
                {/*</div>*/}
                {/*<div className="offset-5 col-md-7">*/}
                {/*    */}
                {/*</div>*/}
            </div>

        </FormWithConstraints>

    };
}

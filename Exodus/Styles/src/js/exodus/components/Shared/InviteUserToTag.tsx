import * as React from 'react';
import {getUserID, getLangValue, getApiKey} from '../../global';
import {User} from "../../models";
import {notify} from '../Shared/Notifications';
import {log} from "util";
//import {CheckedUsers} from "./CheckedUsers";


const shortid = require('shortid');

interface InviteUserToTagState {
    searchQuery: string,
    searchResult: any,
    checkedUsers: any,
    checkedAvatars: any,
    loading: boolean
}

interface InviteUserToTagProps {
    tagID: Number,
    setIsTablesShow?(bool: boolean): any,
    isTablesShow?:boolean

}

export class InviteUserToTag extends React.Component<InviteUserToTagProps, InviteUserToTagState> {
    searchInput: HTMLInputElement | null;
    typingTimeout: any;
    curUserID: number;

    //checkedUsers: any;

    constructor(props: any) {
        super(props);

        this.state = {
            searchQuery: '',
            searchResult: [],
            checkedUsers: [],
            checkedAvatars: [],
            loading: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.sendInviteToUser = this.sendInviteToUser.bind(this);
        this.sendInviteToUsers = this.sendInviteToUsers.bind(this);
        this.handleCheck = this.handleCheck.bind(this)
        this.cancelSearch = this.cancelSearch.bind(this)

        this.typingTimeout = null;
        this.curUserID = +getUserID();
        //this.checkedUsers = [];
    }


    componentDidMount() {

    }

    handleChange() {
        const self = this;
        // this.checkedUsers = []
        // this.setState({
        //     checkedUsers: [],
        //     checkedAvatars: []
        // })
        let searchStr = this.searchInput ? this.searchInput.value : '';
        self.setState({searchQuery: searchStr, loading: true});

        if(this.props.setIsTablesShow) this.props.setIsTablesShow(false)

        // {
        // if(searchStr.length || ) this.props.setIsTablesShow(false)
        // else this.props.setIsTablesShow(true)}

        clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(function () {
            fetch('/api/Search/Users?api_key=' + getApiKey() + '&count=10' + '&query=' + self.state.searchQuery.trim(), {credentials: 'include'})
                .then(response => response.json())
                .then(json => {
                    console.log(json.Data)
                    self.setState({searchResult: json.Data, loading: false});
                });
        }, 1000);
    }

    handleCheck(target: any) {
        const {checkedUsers, checkedAvatars} = this.state
        if (!checkedUsers.includes(target.value)) {
            checkedUsers.push(target.value)
            checkedAvatars.push(target.name)
            this.setState({
                checkedUsers: checkedUsers,
                checkedAvatars: checkedAvatars
            })
            console.log('checkedUsers', checkedUsers, checkedAvatars)
            // console.log('+')
        } else {
            //  const filteredUsers = checkedUsers.filter((user: any) => user !== target.value)
            const del = checkedUsers.findIndex((user: any) => user == target.value)
            checkedUsers.splice(del, 1)
            checkedAvatars.splice(del, 1)
            this.setState({
                checkedUsers: checkedUsers,
                checkedAvatars: checkedAvatars
            })
            //this.setState({checkedUsers: filteredUsers})
            //this.checkedUsers = filteredUsers
            // console.log('filteredUsers', filteredUsers)
            // console.log('-')
        }

    }

    sendInviteToUser = (UserID: number) => {
        if (this.curUserID == UserID)
            notify.error(getLangValue('YouCanNotInviteYourself'));
        else {
            this.setState({loading: true});

            fetch('/api/Tag/InviteUser?TagID=' + this.props.tagID +
                '&InviterUserID=' + this.curUserID +
                '&InvitedUserID=' + UserID, {credentials: 'include'})
                .then(res => {
                    this.setState({loading: false});

                    if (res.ok)
                        notify.success(getLangValue("InvitationSent"))
                });
        }
    }


    sendInviteToUsers() {
        this.state.checkedUsers.forEach((user: any) => this.sendInviteToUser(user))
        this.setState({
            searchQuery: '',
            searchResult: [],
            checkedUsers: [],
            checkedAvatars: []
        })
        if(this.props.setIsTablesShow)this.props.setIsTablesShow(true)
    }

    cancelSearch() {
        this.setState({
            searchQuery: '',
            searchResult: [],
            checkedUsers: [],
            checkedAvatars: []
        })
        if(this.props.setIsTablesShow)this.props.setIsTablesShow(true)
    }



    render() {

        const {
            searchQuery,
            searchResult,
            checkedUsers,
            checkedAvatars,
            loading,
        } = this.state

        //const filteredUsers = searchResult.filter((user: any) => checkedUsers.includes(user.UserID.toString()))
        // console.log(filteredUsers)
        const avatars = checkedAvatars.map((avatar: any) => (
            <img key={shortid.generate()} src={avatar} alt="user"/>
        ))

        return (<>
                <div className="tag-invite-members-container">

                    <div className="tag-invite-members__title">
                        <img src="/Styles/dist/images/icons/add-user.png"/>
                        <p>{getLangValue("InviteMember")}:</p>
                    </div>

                    <div className="tag-invite-members__searchbox">
                        <input
                            ref={el => this.searchInput = el}
                            type="text"
                            placeholder={getLangValue("StartTypeName")}
                            className="tag-invite-members__search-input"
                            onChange={()=>{
                                this.handleChange()

                            }}
                            value={searchQuery}
                        />
                        <button
                            className={this.props.isTablesShow?'disabled-tag-table':''}
                           // disabled={searchQuery.length === 0}
                           // style={searchQuery.length === 0 ? {opacity: '0'} : {}}
                            disabled={this.props.isTablesShow}
                            onClick={() => this.cancelSearch()}>
                            {getLangValue('Cancel')}
                        </button>
                    </div>
                    {/*<button className="tag-invite-members__search-submit" onClick={ this.handleChange }>{getLangValue("Find")}</button>*/}
                </div>
                <div className="tag-invite-members__search-results" data-loading={loading}>
                    {!loading && searchResult.length == 0 && searchQuery.length !== 0 &&
                    <div className="user-not-found">
                        <span>{getLangValue("UserNotFound")}</span>
                    </div>
                    }
                    {searchResult.length > 0 &&
                    searchResult.map((el: any, num: number) => {
                        if (el.UserID == this.curUserID) return;
                        const key = shortid.generate()
                        return (
                            <div key={el.UserID}
                                //onClick={() => this.sendInviteToUser(el.UserID)}
                            >
                                <input type="checkbox"
                                       onChange={e => this.handleCheck(e.target)}
                                       id={key}
                                       checked={checkedUsers.includes(el.UserID.toString())}
                                       value={el.UserID}
                                       name={el.AvatarSmall}
                                />
                                <label htmlFor={key}>
                                    <img
                                        style={checkedUsers.includes(el.UserID.toString()) ?
                                            {borderColor: '#50A5CD'} : {}
                                        }
                                        src={el.AvatarSmall}/>
                                    <span>{el.UserFirstName}<br/>{el.UserLastName}</span>
                                </label>

                            </div>
                        )
                    })
                    }
                    {searchResult.length > 0 && searchResult.length % 2 !== 0 && <div key='add'></div>}
                </div>
                {checkedUsers.length > 0 &&
                <div className='checked-users'>
                    <div className='header'>
                        {`${getLangValue('SelectedMembers')} (${checkedUsers.length}):`}
                    </div>
                    <div className='content'>
                        <div>
                            {avatars}
                        </div>
                        <button onClick={() => this.sendInviteToUsers()}>
                            {getLangValue('SendInvitations')}
                        </button>
                    </div>
                </div>}
            </>
        )
    }
}

export default InviteUserToTag;
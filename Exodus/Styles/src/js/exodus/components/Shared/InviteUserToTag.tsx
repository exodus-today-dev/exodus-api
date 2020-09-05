import * as React from 'react';
import { getUserID, getLangValue, getApiKey } from '../../global';

import { User } from "../../models";
import { notify } from '../Shared/Notifications';
const shortid = require('shortid');

interface InviteUserToTagState  {
    searchQuery: string,
    searchResult: User[],
    loading: boolean
}

interface InviteUserToTagProps {
    tagID: Number;    
}

export class InviteUserToTag extends React.Component<InviteUserToTagProps, InviteUserToTagState> {
    searchInput: HTMLInputElement | null;
    typingTimeout: any;
    curUserID: number;

    constructor(props:any) {      
        super(props);
        this.state = { searchQuery: '', searchResult: [], loading: false };
        this.handleChange = this.handleChange.bind(this);       
        this.sendInviteToUser = this.sendInviteToUser.bind(this);    

        this.typingTimeout = null;
        this.curUserID = +getUserID();
    }

    componentDidMount() {
        
    }

    handleChange() {
        const self = this;

        let searchStr = this.searchInput ? this.searchInput.value : '';
        self.setState({searchQuery: searchStr, loading: true});

        clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(function () {
            fetch('/api/Search/Users?api_key='+ getApiKey() + '&count=10' +'&query='+ self.state.searchQuery.trim(), {credentials: 'include'})
                .then(response=>response.json())
                .then(json=> {
                    self.setState({searchResult: json.Data, loading: false});
                });
        }, 1000);
    }

    sendInviteToUser = (UserID: number) => {
        if (this.curUserID == UserID)
            notify.error(getLangValue('YouCanNotInviteYourself'));       
        else {
            this.setState({loading: true});

            fetch('/api/Tag/InviteUser?TagID='+this.props.tagID+
                '&InviterUserID='+this.curUserID+
                '&InvitedUserID='+UserID, {credentials: 'include'})
            .then(res=>{
                this.setState({loading: false});

                if (res.ok)
                    notify.success(getLangValue("InvitationSent"))
            });
        }
    }

    render() {
        return (
            <div className="tag-invite-members-container">

                <div className="tag-invite-members__title">
                    <img src="/Styles/dist/images/icons/add-user.png" />
                    <p>{getLangValue("InviteMember")}:</p>
                </div>

                <div className="tag-invite-members__searchbox">
                    <input 
                        ref={el => this.searchInput = el}
                        type="text"
                        placeholder={getLangValue("StartTypeName")}
                        className="tag-invite-members__search-input"
                        onChange={this.handleChange}
                        value={this.state.searchQuery}
                    />

                    <button className="tag-invite-members__search-submit" onClick={ this.handleChange }>{getLangValue("Find")}</button>

                    <div className="tag-invite-members__search-results" data-loading={this.state.loading}>
                        {this.state.loading == false && this.state.searchResult.length == 0 &&
                            <div className="user-not-found">
                                <span>{getLangValue("UserNotFound")}</span>
                            </div>
                        }
                        {this.state.searchResult.length > 0 && 
                            this.state.searchResult.map(el => {
                                if (el.UserID == this.curUserID) return;
                                return (
                                    <div key={shortid.generate()} onClick={ 
                                        () => 
                                            this.sendInviteToUser(el.UserID) 
                                    }>
                                        <img src={el.AvatarSmall} />
                                        <span>{el.UserFullName}</span>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>

            </div>
        )
    }
}

export default InviteUserToTag;
import { Status } from './enums';

class Model {
    constructor(params: any) {
        Object.assign(this, params);
    }
}

export class User extends Model{
    UserID: number;
    FirstName: string;
    LastName: string;
    Status: Status;
    AvatarSmall: string;
    UserFullName: string;
}

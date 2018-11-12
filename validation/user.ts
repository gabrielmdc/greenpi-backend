import { IUser } from "../models/interface/user";
import { NameRegex, EmailRegex,  PasswordRegex, FacebookIdRegex,
    GoogleIdRegex, IdRegex}
    from "./rules/user";
import { regexValidation, createError, rejectIfNull } from "./helpers";
import { FacebookAccount } from "../models/interface/facebook-account.";
import { GoogleAccount } from "../models/interface/google-account";

export function validateName(name: string): Promise<string>  {
    return regexValidation(name, NameRegex, 'The user must have a valid name');
}

export function validateEmail(email: string): Promise<string>  {
    return regexValidation(email, EmailRegex,
        'The user must have a valid email');
}

export function validatePassword(password: string): Promise<string>  {
    return regexValidation(password, PasswordRegex,
        'The user must have a valid password');
}

export function validateFacebook(facebookAccount?: FacebookAccount):
Promise<null | FacebookAccount> {
    if (!facebookAccount) {
        return Promise.resolve(null);
    }
    return regexValidation(facebookAccount.id, FacebookIdRegex,
        'The Facebook Id must be a valid Id')
    .then(() => facebookAccount);
}

export function validateGoogle(googleAccount?: GoogleAccount):
Promise<null | GoogleAccount> {
    if (!googleAccount) {
        return Promise.resolve(null);
    }
    return regexValidation(googleAccount.id, GoogleIdRegex,
        'The Google Id must be a valid Id')
    .then(() => googleAccount);
}

export function validateId(id: string): Promise<string> {
    if(id && IdRegex.test(id)) {
        return Promise.resolve(id);
    }
    let err: Error = createError('Invalid user id');
    return Promise.reject(err);
}

export function validate(user: IUser,
    checkPassword: boolean = false,
    checkId: boolean = false):
Promise<IUser> {
    return rejectIfNull(user, 'User is null or undefined')
    .then(() => validateName(user.name))
    .then(() => validateEmail(user.email))
    .then(() => checkPassword? validatePassword(user.password) :
    Promise.resolve(null))
    .then(() => validateFacebook(user.facebook))
    .then(() => validateGoogle(user.google))
    .then(() => checkId? validateId(user.id) : Promise.resolve(null))
    .then(() => Promise.resolve(user))
    .catch(err => {
        err.message = 'Invalid user: ' + err.message;
        return Promise.reject(err);
    });
}

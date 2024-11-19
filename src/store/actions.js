import { CHANGE_USER, CHANGE_USER_BACKGROUND } from "./constants";

export const changeUserBackground = (payload) =>{
    return {
        type: CHANGE_USER_BACKGROUND,
        payload
    }
}

export const changeUser = (payload) =>{
    return {
        type: CHANGE_USER,
        payload
    }
}
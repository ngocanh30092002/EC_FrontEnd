import { CHANGE_USER_BACKGROUND } from "./constants";

const initState = {
    isReloadUserBackground: false,
};

function reducer(state, action){
    switch(action.type){
        case CHANGE_USER_BACKGROUND:
            if(state.isReloadUserBackground !== action.payload){
                return {
                    ...state,
                    isReloadUserBackground: action.payload
                }
            }
            return state;
        default: 
            throw new Error("Invalid action.");
    }
};

export {initState}
export default reducer;

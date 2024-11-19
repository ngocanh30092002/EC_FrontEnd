import { CHANGE_USER_BACKGROUND, CHANGE_USER } from "./constants";

const initState = {
    isReloadUserBackground: false,
    user: {}
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
        case CHANGE_USER:
            return{
                ...state,
                user: action.payload
            }
        default: 
            throw new Error("Invalid action.");
    }
};

export { initState };
export default reducer;

import * as authvalid from "../utils/authvalid";
import * as transaction from "../utils/transaction"
import * as constants from "../utils/constants"

export function registerthyself(request){

    const memberId = request.caller.id;
    const body = request.body.json();
    const user_id = body.user_id

    console.log(`Member ${memberId} called to registered the central bank ${user_id}`)
    
    if(!(authvalid.validateMemberId(memberId) && authvalid.validateUserId(user_id))){
        return {
            statusCode:404,
            body:{
                "status":"Failed",
                "message":"Either member invalid or user not found"
            }
        }   
    }

    authvalid.setCentralBankUserId(user_id)    
    const new_central_bank = authvalid.whoisCentralBank()            
    
    console.log(`Member ${memberId} called to registered the central bank ${new_central_bank}`)

    return {
        statusCode: 200,
        body:{
            "status":"Success",
            "message":`${user_id} is the central bank`
        }
    }     
}

export function pledge(request){
    const callerId = request.caller.id;
    const body = request.body.json();
    const user_id = body.user_id;
    const amount = body.amount;
    const current_central_bank = authvalid.whoisCentralBank()

    console.log(`User ${callerId} called to pledge ${amount} for ${user_id}`)

    if(!(authvalid.validateUserId(callerId) && callerId == current_central_bank && authvalid.validateUserId(user_id))){
        return {
            statusCode:404,
            body:{
                "status":"Failed",
                "message":"Central bank or pledge user not recognized"
            }
        }
    }

    transaction.pledge(user_id,
        amount,
        constants.SYSTEM_CURRENCY)

    return {
        statusCode:200,
        body:{
            "status":"Success",
            "message":`${user_id} has received ${amount}`
        }
    };   
}
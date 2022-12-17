import * as ccfapp from "@microsoft/ccf-app";
import {ccf} from "@microsoft/ccf-app/global";

import * as authvalid from "../utils/authvalid";

export function registerthyself(request){

    const memberId = request.caller.id;
    const body = request.body.json();
    const user_id = body.user_id

    console.log(`Member ${memberId} called to registered the central bank ${user_id}`)
    
    if(authvalid.validateMemberId(memberId))
    {
        if(authvalid.validateUserId(user_id))
        {
            authvalid.setCentralBankUserId(user_id)

            const new_central_bank = authvalid.whoisCentralBank()            
            console.log(`Member ${memberId} called to registered the central bank ${new_central_bank}`)

            return {
                body:{
                    "status":"Success",
                    "message":`${user_id} is the central bank`
                }
            }
        }
    }

    return {
        statusCode:404,
        body:{
            "status":"Failed",
            "message":"Either member invalid or user not found"
        }
    }    
}

export function pledge(request){
    //not implemented yet
}
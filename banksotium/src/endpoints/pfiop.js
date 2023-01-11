import * as authvalid from "../utils/authvalid";
import * as transaction from "../utils/transaction"
import * as constants from "../utils/constants"

export function getbalance(request){
    const caller = request.caller.id;
    
    if(!authvalid.validateUserId(caller)){
        return {
            statusCode:404,
            body:{
                "status":"Failed",
                "message":"Caller not found"
            }
        }   
    }

    const latest_balance = transaction.balance(caller);

    return {
        statusCode: 200,
        body:{
            "status":"Success",
            "balance": latest_balance
        }
    }  
}

export function getreceipt(request){
    const caller = request.caller.id;
    const body = request.body.json();
    
    if(!authvalid.validateUserId(caller)){
        return {
            statusCode:404,
            body:{
                "status":"Failed",
                "message":"Caller not found"
            }
        }   
    }

    var receiptObj = transaction.receipt(caller,body.lSeq == constants.S_LATEST?null:body.lSeq);
    
    return {
        statusCode: 200,
        body:{
            "status":"Success",
            "receipt": JSON.stringify(receiptObj)
        }
    }    
}

export function transfer(request){

    const caller = request.caller.id;
    const body = request.body.json();

    if(!authvalid.validateUserId(caller)){
        return {
            statusCode:404,
            body:{
                "status":"Failed",
                "message":"Caller not found"
            }
        }   
    }

    if(!authvalid.validateUserId(body.acquirer)){
        return {
            statusCode:400,
            body:{
                "status":"Failed",
                "message":"Acquiring PFI not found"
            }
        }   
    }

    transaction.transfer(caller,
        body.amount,
        body.acquirer,
        constants.SYSTEM_CURRENCY)
    
        return {
            statusCode: 200,
            body:{
                "status":"Success",
                "message": `Transfer of ${body.amount} ${constants.SYSTEM_CURRENCY} completed from ${caller} to ${body.acquirer}`
            }
        } 

}
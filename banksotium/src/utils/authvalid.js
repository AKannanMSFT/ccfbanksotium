import * as ccfapp from "@microsoft/ccf-app";
import {ccf} from "@microsoft/ccf-app/global";

const CB_KEY = "centralbank"

export function validateMemberId(memberId){
    const memberInfo = ccfapp.rawKv['public:ccf.gov.members.info'];
    const memberKey = ccf.strToBuf(memberId)

    console.log(`Member ${memberId} lookup:`)

    if(!memberInfo.has(memberKey)){
        console.log('Failed to find member')
        return false
    }

    const memberVal = ccf.bufToJsonCompatible(memberInfo.get(memberKey))
    console.log(`Status ${memberVal.status}`)
        
    if(memberVal.status=="Active"){
        return true
    }
    
    return false
}

export function validateUserId(userId,verbose=false){
    const userInfo = ccfapp.typedKv('public:ccf.gov.users.certs',
    ccfapp.string,
    ccfapp.string);

    if(!userInfo.has(userId)){
        console.log(`User ${userId} lookup failed`)        
        return false
    }

    if(verbose){
        const userVal = userInfo.get(userId);
        console.log(`User Info ${JSON.stringify(userVal)}`)   
    }
    
    return true
}

function centralBankUserId(){
    return ccfapp.typedKv('whois',
    ccfapp.string,
    ccfapp.string)
}

export function setCentralBankUserId(userId){
    const cbUserEntry = centralBankUserId()
    cbUserEntry.set(CB_KEY,userId)
}

export function whoisCentralBank(){
    const cbUserEntry = centralBankUserId()
    return cbUserEntry.get(CB_KEY)
}
import * as ccfapp from "@microsoft/ccf-app";
import * as tokenstruct from "../struct";
import { plainToInstance, instanceToPlain } from 'class-transformer';
import * as constant from '../utils/constants'

const seqKVName = 'sequenceStore'
const seqLatestKey = 'GLOBAL'
const objStoreKVName = 'objStore'

// Sequence Key Store (stores ledger depth)
const seqKV = ccfapp.typedKv(seqKVName,
    ccfapp.string,
    ccfapp.uint64)

// Object store that has DDR and DDORs stored
const objStoreKV = ccfapp.typedKv(objStoreKVName,
ccfapp.string,
ccfapp.json())

// Account state store that keeps track of balance
function accStateKV(user_id){
    return ccfapp.typedKv(`accState:${user_id}`,
    ccfapp.uint64,
    ccfapp.json())
}

// Functions to perform get & set from Seq store
function getLatestGSeq(){
    // gets the latest global sequence of the ledger
    if(!seqKV.has(seqLatestKey))
    {
        return -1;
    }

    return seqKV.get(seqLatestKey)
}

function incrementLatestGSeq(){
    // increments the latest global sequence of the ledger
    seqKV.set(seqLatestKey,BigInt(getLatestGSeq()+1))
}

function getLatestSeq(user_id){
    if(!seqKV.has(user_id))
    {        
        //first time that the account is getting accessed
        return null
    }

    // Latest Sequence for the account
    return seqKV.get(user_id)
}

// Functions to handle State
function getLatestState(user_id){
    
    const latestAcc = getLatestSeq(user_id)
    
    if(!latestAcc)
    {
        // account has not been created
        return null
    }

    // Accounts State KV
    const accountStateKV = accStateKV(user_id)
    const accountStateGotten = accountStateKV.get(latestAcc)

    return plainToInstance(tokenstruct.AccountState,accountStateGotten)
}

function setLatestState(user_id,obj){
    // This function sets the latest object state
    var latestEntry = getLatestSeq(user_id)

    if(!latestEntry)
    {
        latestEntry = -1
    }

    latestEntry += 1
    const accountStateKV = accStateKV(user_id)
    const objToWrite = instanceToPlain(obj)

    seqKV.set(user_id,BigInt(latestEntry))
    accountStateKV.set(BigInt(latestEntry),objToWrite)
}

function addToObjectStore(objID, obj){
    const objToWrite = instanceToPlain(obj)
    // add object to object store
    objStoreKV.set(objID,objToWrite)
}

function fetchAccountSeq(user_id,lseq){
    // returns the object stored in user_id, lseq
    const accountStateKV = accStateKV(user_id)
    const accountStateGottent = accountStateKV.get(lseq)
    
    return plainToInstance(tokenstruct.AccountState,accountStateGottent)
}

// Exported functions for banking operations
export function pledge(ben_user,amount,currency){
    
    //Originate fund into a user account
    const requestTime = new Date()
    const gSeqLatest = getLatestGSeq()

    var lSeqLatest = getLatestSeq(ben_user)
    var newAccount = false

    if(!lSeqLatest){
        lSeqLatest = -1
        newAccount = true
    }

    const lSeq = lSeqLatest +1
    const gSeq = gSeqLatest + 1

    const ddro = new tokenstruct.DDO(ben_user,
        requestTime.toString(),
        amount,
        currency,
        tokenstruct.FlowTypeEnum.Pledge,
        tokenstruct.RequestStatusEnum.Approve,
        gSeq,
        lSeq
        )
        
    var balance = amount
    if(!newAccount){
        const currentState = getLatestState(ben_user)
        balance = amount + currentState.Balance
    }

    const accountState = new tokenstruct.AccountState(ben_user,
        balance,
        currency,
        lSeq,
        gSeq,
        ddro.ID)
    
    
    addToObjectStore(ddro.ID,ddro)
    setLatestState(ben_user,accountState)
    incrementLatestGSeq()
}

export function transfer(issue_user,amount,acq_user,currency){
    //Transfer fund from issuer to acquirer
    const requestTime = new Date()
    const gSeqLatest = getLatestGSeq()
    const ilSeqLatest = getLatestSeq(issue_user)
    var newAccount = false
    const gSeq = gSeqLatest + 1

    if(!ilSeqLatest){
        throw new Error("Account doesn't exist. Get a pledge or inward transfer")
    }

    const sAccountState = getLatestState(issue_user)

    if(sAccountState.Balance<amount){
        throw new Error("Insufficient balance in source account")
    }

    const dlSeqLatest = getLatestSeq(acq_user)
    if(!dlSeqLatest){
        //first ever transaction for acquiring user
        newAccount = true
    }

    var sBalance = sAccountState.Balance
    var dBalance = 0
    var sLSeq = ilSeqLatest + 1
    var dLSeq = 0

    if(!newAccount){
        const currentState =  getLatestState(acq_user)
        dBalance = currentState.Balance
        dLSeq = currentState.LSeq + 1
    }

    sBalance = sBalance - amount
    dBalance = dBalance + amount
    
    const ddr = new tokenstruct.DD(issue_user,
        requestTime.toString(),
        amount,
        currency,
        acq_user,
        gSeq,
        sLSeq,
        dLSeq
        )
    
    const sAccountEndState = new tokenstruct.AccountState(issue_user,
        sBalance,
        currency,
        sLSeq,
        gSeq,
        ddr.ID)
    
    const dAccountEndState = new tokenstruct.AccountState(acq_user,
        dBalance,
        currency,
        dLSeq,
        gSeq,
        ddr.ID)
    
    addToObjectStore(ddr.ID,ddr)
    setLatestState(issue_user,sAccountEndState)
    setLatestState(acq_user,dAccountEndState)
    incrementLatestGSeq()
}

function getLSeqSafe(pfi,lseq){

    const latestSeq = getLatestSeq(pfi)

    if(!latestSeq){
        return 0;
    }

    if(lseq == constant.S_LATEST){
        lseq = latestSeq
    }

    if(lseq > latestSeq){
        throw new Error("Future look up. Sequence not found")
    }

    return lseq
}

export function balance(pfi,lseq=constant.S_LATEST){
    // Returns the balance of a pfi.
    // if lseq not provided, returns the latest balance
    
    const lSeq = getLSeqSafe(pfi,lseq)
    const accountState = fetchAccountSeq(pfi,lSeq)

    return accountState.Balance
}

export function receipt(pfi,lseq=constant.S_LATEST){
    // Returns the receipt of the object
    // if the lseq not provided, return the latest receipt
    const lSeq = getLSeqSafe(pfi,lseq)
    const accountState = fetchAccountSeq(pfi,lSeq)

    const objinStore = objStoreKV.get(accountState.ObjID)

    var objToSend = null
    if(objinStore.hasOwnProperty("RequestingPFI")){
        //DDOR
        objToSend = plainToInstance(tokenstruct.DDOR,objinStore)
    }
    else{
        objToSend = plainToInstance(tokenstruct.DD,objinStore)
    }

    return objToSend.getReceipt(pfi)
}
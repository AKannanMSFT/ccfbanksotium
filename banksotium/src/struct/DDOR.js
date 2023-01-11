export class DDOR{
    constructor(
        ogDDRO
        ){
            this.RequestingPFI = ogDDRO.RequestingPFI,
            this.RequestTime = ogDDRO.RequestTime,
            this.Amount = ogDDRO.Amount,
            this.Currency = ogDDRO.Currency,
            this.Type = ogDDRO.Type,
            this.Status = ogDDRO.Status,
            this.LSeq = ogDDRO.LSeq
        }
}

export class DDO{
    constructor(
        RequestingPFI,
        RequestTime,
        Amount,
        Currency,
        Type,
        Status,
        GSeq,
        LSeq
        ){
            this.RequestingPFI = RequestingPFI,
            this.RequestTime = RequestTime,
            this.Amount = Amount,
            this.Currency = Currency,
            this.Type = Type,
            this.Status = Status,
            this.GSeq = String(GSeq),
            this.LSeq = String(LSeq),
            this.ID = `${RequestingPFI}-${LSeq}`
        }
    
    getReceipt(forPFI){
        
        if(forPFI != this.RequestingPFI)
        {
            throw new Error("PFI does not have view permissions")
        }

        return new DDOR(this);
    }
}
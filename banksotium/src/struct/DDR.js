export class DDR{
    constructor(
        ogDDR,
        forPFI,
        LSeq,
        ){
            this.IssuingPFI = ogDDR.IssuingPFI,
            this.IssueTime = ogDDR.IssueTime,
            this.Amount = ogDDR.Amount,
            this.Currency = ogDDR.Currency,
            this.AcquiringPFI = ogDDR.AcquiringPFI,
            this.LSeq = LSeq,
            this.ID = `${forPFI}-${LSeq}`
        }
}

export class DD{
    constructor(
        IssuingPFI,        
        IssueTime,        
        Amount,
        Currency,
        AcquiringPFI,
        GSeq,
        sLSeq,
        dLSeq
        ){
            this.IssuingPFI = IssuingPFI,
            this.IssueTime = IssueTime,
            this.Amount = Amount,
            this.Currency = Currency,
            this.AcquiringPFI = AcquiringPFI,
            this.GSeq = String(GSeq),
            this.sLSeq = String(sLSeq),
            this.dLSeq = String(dLSeq),
            this.ID = `${IssuingPFI}-${sLSeq}-${AcquiringPFI}-${dLSeq}`
        }
    
    getReceipt(forPFI){
        var LSeq = BigInt(0)
        if(forPFI == this.IssuingPFI)
        {
            LSeq = this.sLSeq
        }

        if(forPFI == this.AcquiringPFI)
        {
            LSeq = this.dLSeq
        }

        if(!LSeq)
        {
            throw new Error("PFI does not have view permissions")
        }

        return new DDR(this,forPFI,LSeq);
    }
}
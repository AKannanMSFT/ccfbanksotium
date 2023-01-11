export class AccountState{
    constructor(
        PFI,
        Balance,
        Currency,
        LSeq,
        GSeq,
        ObjID
        ){
            this.PFI = PFI,
            this.Balance = String(Balance),
            this.Currency = Currency,
            this.GSeq = String(GSeq),
            this.LSeq = String(LSeq),
            this.ObjID = ObjID
        }
}
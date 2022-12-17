export { registerthyself, pledge } from "./endpoints/cbonlyop";
export {getpfibalance} from  "./endpoints/balances";

export function heartbeat(request){
    return {body:"Being Alive"}
}
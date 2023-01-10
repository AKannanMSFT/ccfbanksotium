export { registerthyself, pledge } from "./endpoints/cbonlyop";
export {getbalance} from  "./endpoints/pfiop";

export function heartbeat(request){
    return {body:"Being Alive"}
}
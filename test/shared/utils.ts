import { Signer } from "ethers";

export function impostorContractInArray(contracts: any[], account: Signer, point: number, sndPoint?: number): any[] {
  const newArr = [...contracts];
  newArr[point] = account;
  if(sndPoint) newArr[sndPoint] = account;
  
  return newArr;
}
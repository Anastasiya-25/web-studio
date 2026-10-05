import {RequestType} from "./request.type";

export type OrderType ={
  name: string;
  phone: string;
  service?: string;
  type: RequestType;
}

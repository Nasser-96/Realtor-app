export type ReturnResponseType<T> =
{
        is_successful:boolean,
        response:T,
        error_msg:string,
        success:string
}

export default function ReturnResponse(response?:any,error?:any, success?:string)
{
    return {is_successful:error? false:true,response:response, error_msg:error? error:"", success:success ? success :""}
}
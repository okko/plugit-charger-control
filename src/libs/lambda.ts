import middy from "@middy/core"
import { Context, Callback } from "aws-lambda"

export const middyfy = (handler: ((event: any, context: Context, callback: Callback<any>) => void | Promise<any>) | undefined) => {
  return middy(handler)
}

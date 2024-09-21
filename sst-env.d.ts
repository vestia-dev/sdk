/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "PosthogAPIKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "VestiaDemo": {
      "type": "sst.aws.Remix"
      "url": string
    }
    "VestiaDocs": {
      "type": "sst.aws.Astro"
      "url": string
    }
  }
}
export {}

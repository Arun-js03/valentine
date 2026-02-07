declare module "cloudinary" {
  export namespace v2 {
    export const config: (config: {
      cloud_name?: string;
      api_key?: string;
      api_secret?: string;
    }) => void;

    export namespace uploader {
      export function upload_stream(
        options: any,
        callback?: (error: any, result: any) => void
      ): any;
      export function upload(
        file: string,
        options?: any,
        callback?: (error: any, result: any) => void
      ): Promise<any>;
    }
  }
}

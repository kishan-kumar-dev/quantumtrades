declare module "swagger-ui-react" {
  import * as React from "react";
  interface SwaggerUIProps {
    url?: string;
    spec?: object;
  }
  export default class SwaggerUI extends React.Component<SwaggerUIProps> {}
}

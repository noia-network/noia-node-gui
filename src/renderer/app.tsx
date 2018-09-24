import * as React from "react";
import * as ReactDOM from "react-dom";

import "typeface-roboto";
import "typeface-roboto-mono";

import { AppRouter } from "./routing/app-router";
import "./global-actions-handler";

import "./app.scss";

ReactDOM.render(<AppRouter />, document.getElementById("root"));

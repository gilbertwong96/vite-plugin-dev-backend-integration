# vite-plugin-dev-backend-integration

> A plugin integrate with backend served template of `vite HMR`

## Install

```bash

    yarn add vite-plugin-dev-backend-integration

    //or
    npm i vite-plugin-dev-backend-integration

```

## Use

```js
import { defineConfig } from "vite";
import path from "path";
import viteBackendIntegration, {
	createEntryPoint,
} from "vite-plugin-dev-backend-integration";

const entryPoint = createEntryPoint({
	root: process.cwd(),
	input: "./src/app/main.js",
	output: "path/to/output/app/main.js",
});
const extraDeps = ["path/to/dep.js", "path/to/dep.css", "path/to/dep.scss"];
extraDeps.forEach((dep) => entryPoint.add(dep));

const entryPoints = [entryPoint];
export default defineConfig({
	server: { port: 3000 },
	plugins: [viteBackendIntegration(entryPoints)],
});
```

## Movitation

For some reasons, our application has to use a backend rendering mode, such as the `phoenixframework/phoenix`. At the same time, the front-end wants to use `vite` as the dev server with HMR, which is a conflict. Now, using `vite-plugin-dev-backend-integration` can help solve this problem.

For example (phoenixframework/phoenix)

Your backend served template (`layout.html.eex`)

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<meta http-equiv="X-UA-Compatible" content="IE=edge" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no"
		/>
		<meta name="format-detection" content="telephone=no" />
		<meta name="description" content="" />
		<meta name="author" content="" />
		<title><%= get_page_title(@conn) %></title>
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="mobile-web-app-capable" content="yes" />
		<script>
			window._global_configs = {
				locale: "<%= @locale %>",
				current_path: "<%= current_path(@conn)%>",
				view_template: "<%= current_view_template %>",
				view_module: "<%= current_view_module %>",
				view_data: null,
			};
			_global_configs.serverEnv =
				'<%= Application.get_env(:app, :server_env, "dev")%>';
		</script>
	</head>
	<body class="<%= get_theme(@conn) %>">
		<%= render view_module(@conn), view_template(@conn), assigns %>
		<script src='<%= static_path(@conn, "/app/main.js") %>'></script>
	</body>
</html>
```

```js
//`src/app/main.js`

import "./style.scss";
import App from "./App";
if (_global_configs.serverEnv == "dev") {
	import("./createDevApp").then(({ createApp }) => {
		createApp(Component);
	});
} else if (_global_configs.serverEnv == "pros") {
	import("./createApp").then(({ createApp }) => {
		createApp(Component);
	});
}
```

the plugin will generate an 'empty' bundle with these codes

```js
// priv/static/app/main.js
(async () => {
	// load vite client , which can enable hmr
	await import("http://{host}:{port}/@vite/client");
	//load deps before entry , if have deps
	await import("http://{host}:{port}/path/to/dep.js");
	await import("http://{host}:{port}/path/to/dep.css");
	await import("http://{host}:{port}/path/to/dep.js");
	// load entry
	await import("http://{host}:{port}/src/app/main.js");
})();
```

now you can work with `vite HMR` in your backend project

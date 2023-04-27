# vite-plugin-dev-backend-intergration

> A plugin intergrate with backend served template of `vite-dev-server`

## Install

```bash

    yarn add vite-plugin-dev-backend-intergration

    //or
    npm i vite-plugin-dev-backend-intergration

```

## Use

```js
import { defineConfig } from "vite";
import path from "path";
import viteBackendIntegration from "vite-plugin-dev-backend-intergration";
const entryPoints = [
	{
		input: "./src/app/main.js",
		output: "path/to/backend-server/static/app/main.js",
	},
];
export default defineConfig({
	server: { port: 3000 },
	plugins: [viteBackendIntegration(entryPoints)],
});
```

## Movitation

For some reasons, our application has to use a backend rendering mode, such as the `phoenixframework/phoenix`. At the same time, the front-end wants to use `vite` as the dev server with HMR, which is a conflict. Now, using `vite-plugin-dev-backend-integration` can help solve this problem.

For example

```js
//`src/app/main.js`
var foo = global_variable1;
var bar = {};
```

the plugin will generate an 'empty' bundle with these codes

```js
// backend-server/static/app/main.js

const client = document.createElement("script");
client.src = "http://localhost:3000/@vite/client";
client.type = "module";
const main = document.createElement("script");
main.src = "http://localhost:3000/src/app/main.js";
main.type = "module";
main.crossorigin = "anonymous";
document.body.appendChild(client);
document.body.appendChild(main);
```

```html
// backend-server/template/some/template.html
...
<script>
    var global_variable1 = 'hello'
    var global_variable2 = 'world'
</script>
<script src='<%= static_path(@conn, "/js/app/main.js") %>'></script>
</body>
```

in browser you will see

```html
<script>
    var global_variable1 = 'hello'
    var global_variable2 = 'world'
</script>
<script src="/path/to/backend/static/app/main.js" ></script>
<script src="http://localhost:3000/@vite/client" ></script>
<script src="http://localhost:3000/src/app/main.js" ></script>
</body>
```

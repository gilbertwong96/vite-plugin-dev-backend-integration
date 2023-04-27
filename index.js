import path from "node:path";
import fs from "node:fs";
function outputFile(file, data, option = "utf-8") {
	let dir = path.dirname(file);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(file, data, option);
}
function template(entryPoint, server) {
	return `
const client = document.createElement("script");
client.src = "${server.origin}/@vite/client";
client.type = "module";
const main = document.createElement("script");
main.src = "${server.origin}/${entryPoint}";
main.type = "module";
main.crossorigin="anonymous"
document.body.appendChild(client);
document.body.appendChild(main);
`;
}
function viteBackendIntegration(entryPoints = []) {
	var config;
	return {
		name: "vite-plugin-dev-backend-intergration",
		apply: "serve",
		enforce: "pre",
		configResolved: function (c) {
			config = c;
		},
		configureServer: function (resolvedConfig) {
			var server = resolvedConfig.config.server;
			var host = server.host || "localhost";
			var protocol = server.https ? "https://" : "http://";
			server.cors = true;
			if (!server.origin) {
				server.origin = ""
					.concat(protocol)
					.concat(host, ":")
					.concat(server.port);
			}
		},
		buildStart: function () {
			if (!entryPoints.length) return;
			entryPoints.forEach(function (_a) {
				var input = _a.input,
					output = _a.output;
				input = input.replace(config.root, "");
				var data = template(input, config.server);
				outputFile(output, data);
			});
		},
	};
}

export default viteBackendIntegration;

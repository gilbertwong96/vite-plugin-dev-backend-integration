const path = require("path");
const fs = require("fs");
function outputFile(file, data, option = "utf-8") {
	let dir = path.dirname(file);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(file, data, option);
}
function template(entryPoint, root, server) {
	let entries = entryPoint.map((entry, index) => {
		entry = entry.replace(root, "").replace(/^(\/)/, "");
		return `const entry_${index} = document.createElement("script");
		entry_${index}.src = "${server.origin}/${entry}";
		entry_${index}.type = "module";
		entry_${index}.crossorigin="anonymous";
		document.body.appendChild(entry_${index});`.trim();
	});

	return `
const client = document.createElement("script");
client.src = "${server.origin}/@vite/client";
client.type = "module";
document.body.appendChild(client);
${entries.join("\n")}
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
			entryPoints.forEach(function ({ input, output }) {
				if (!Array.isArray(input)) input = [input];
				var data = template(input, config.root, config.server);
				outputFile(output, data);
			});
		},
	};
}
module.exports = viteBackendIntegration;

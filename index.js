const path = require("path");
const fs = require("fs");
function outputFile({ dest, code }, option = "utf-8") {
	let dir = path.dirname(dest);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(dest, code, option);
}
class EntryPoint {
	constructor({ input, root, output }) {
		this.root = root || process.cwd();
		this.output = output;
		this.input = this.normalizeInput(input);
		this.deps = ["/@vite/client"];
	}
	normalizeInput = (input) => {
		if (!input) return null;
		input = input
			.replace(this.root, "")
			.replace(/^(\/)(\/?)/, "")
			.trim();
		return `/${input}`;
	};
	add(input) {
		this.deps.push(this.normalizeInput(input));
	}
	toImport(base) {
		const req = [...this.deps, this.input]
			.filter(Boolean)
			.map((file) => base + file);
		const code = req.map((x) => `await import('${x}');`).join("\n");
		return { code: this.wrapper(code), dest: this.output };
	}
	wrapper = (codes) =>
		`(async function (){${codes}})();`.replace(/\n/g, "").trim();
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
			const origin = config.server.origin;
			entryPoints.forEach((entryPoint) => {
				if (entryPoint instanceof EntryPoint) {
					const { code, dest } = entryPoint.toImport(origin);
					outputFile({ dest, code });
				}
			});
		},
	};
}

module.exports = viteBackendIntegration;
module.exports.createEntryPoint = ({ input, output, root }) =>
	new EntryPoint({ input, output, root });

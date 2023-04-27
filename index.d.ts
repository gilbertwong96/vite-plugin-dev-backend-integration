import { ResolvedConfig, ViteDevServer } from "vite";
declare type EntryPoint = {
	input: string;
	output: string;
};
declare type EntryPoints = EntryPoint[];
declare function viteBackendIntegration(entryPoints?: EntryPoints): {
	configResolved(c: ResolvedConfig): void;
	configureServer(resolvedConfig: ViteDevServer): void;
	buildStart(): void;
};
export default viteBackendIntegration;

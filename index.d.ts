import { ResolvedConfig, ViteDevServer } from "vite";
declare type EntryPoint = {
	input: string;
	output: string;
	root: string;
};
declare type EntryPoints = EntryPoint[];
declare function viteBackendIntegration(entryPoints?: EntryPoints): {
	configResolved(c: ResolvedConfig): void;
	configureServer(resolvedConfig: ViteDevServer): void;
	buildStart(): void;
};
declare function createEntry(entryPoint: EntryPoint): EntryPoint;
export default viteBackendIntegration;
export { createEntry };

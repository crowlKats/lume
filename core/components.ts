import { extname } from "../deps/path.ts";
import { Page } from "./filesystem.ts";

import type { ComponentsTree, Data } from "../core.ts";

export interface Options {
  globalData: Data;
  path: string;
  cssFile: string;
  jsFile: string;
}

/**
 * Class to manage the components.
 */
export default class Components {
  globalData: Data;
  path: string;
  cssFile: string;
  jsFile: string;

  css = new Map<string, string>();
  js = new Map<string, string>();

  constructor(options: Options) {
    this.globalData = options.globalData;
    this.path = options.path;
    this.cssFile = options.cssFile;
    this.jsFile = options.jsFile;
  }

  /**
   * Create and returns a proxy to use the components
   * as comp.name() instead of components.get("name").render()
   */
  toProxy(components: ComponentsTree): ProxyComponents {
    return new Proxy(components, {
      get: (target, name) => {
        if (typeof name !== "string") {
          return;
        }

        const key = name.toLowerCase();
        const component = target.get(key);

        if (!component) {
          throw new Error("Component not found: " + name);
        }

        if (component instanceof Map) {
          return this.toProxy(component);
        }

        // Save CSS & JS code for the component
        if (component.css) {
          this.css.set(key, component.css);
        }

        if (component.js) {
          this.js.set(key, component.js);
        }

        // Return the function to render the component
        return (props: Record<string, unknown>) =>
          component.render({ ...this.globalData, ...props });
      },
    }) as unknown as ProxyComponents;
  }

  /**
   * Generate and returns the assets used by the components
   */
  getAssets(): Page[] {
    const assets: Page[] = [];

    if (this.css.size) {
      assets.push(this.#createPage(this.css.values(), this.cssFile));
    }

    if (this.js.size) {
      assets.push(this.#createPage(this.js.values(), this.jsFile));
    }

    return assets;
  }

  #createPage(code: IterableIterator<string>, path: string): Page {
    const page = new Page();
    const ext = extname(path);
    page.dest.ext = ext;
    page.dest.path = path.slice(0, -ext.length);
    page.content = Array.from(code).join("\n");
    return page;
  }
}

export interface ProxyComponents {
  [key: string]: ((props: Record<string, unknown>) => string) | ProxyComponents;
}

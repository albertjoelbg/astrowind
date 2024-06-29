const property3 = new Proxy({"src":"/_astro/property3.33aVJl8w.jpg","width":1080,"height":720,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property3.jpg";
							}
							
							return target[name];
						}
					});

export { property3 as default };

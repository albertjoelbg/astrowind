const property1 = new Proxy({"src":"/_astro/property1.BWKPBOrL.jpg","width":1080,"height":720,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property1.jpg";
							}
							
							return target[name];
						}
					});

export { property1 as default };

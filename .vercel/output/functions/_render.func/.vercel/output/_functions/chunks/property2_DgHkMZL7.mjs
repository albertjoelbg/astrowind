const property2 = new Proxy({"src":"/_astro/property2.C3vq_tH_.jpg","width":1080,"height":711,"format":"jpg","orientation":1}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property2.jpg";
							}
							
							return target[name];
						}
					});

export { property2 as default };

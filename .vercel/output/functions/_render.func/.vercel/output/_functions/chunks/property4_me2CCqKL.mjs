const property4 = new Proxy({"src":"/_astro/property4.C8yCp1Vx.jpg","width":4500,"height":3000,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/property4.jpg";
							}
							
							return target[name];
						}
					});

export { property4 as default };

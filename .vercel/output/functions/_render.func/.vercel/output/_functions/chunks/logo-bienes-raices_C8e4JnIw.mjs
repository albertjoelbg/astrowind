const logoBienesRaices = new Proxy({"src":"/_astro/logo-bienes-raices.CtgdMZuF.png","width":748,"height":403,"format":"png"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/logo-bienes-raices.png";
							}
							
							return target[name];
						}
					});

export { logoBienesRaices as default };

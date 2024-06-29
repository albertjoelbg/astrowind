const inversiones = new Proxy({"src":"/_astro/inversiones.KHytCr6J.jpg","width":657,"height":659,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/inversiones.jpg";
							}
							
							return target[name];
						}
					});

export { inversiones as default };

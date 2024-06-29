const adquisicion = new Proxy({"src":"/_astro/adquisicion.Cin75cd6.jpg","width":670,"height":380,"format":"jpg"}, {
						get(target, name, receiver) {
							if (name === 'clone') {
								return structuredClone(target);
							}
							if (name === 'fsPath') {
								return "C:/Users/alber/WebstormProjects/astrowind/src/assets/images/adquisicion.jpg";
							}
							
							return target[name];
						}
					});

export { adquisicion as default };

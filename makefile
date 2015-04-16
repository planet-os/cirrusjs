all:
	uglifyjs ./src/core.js ./src/utils.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/interaction.js ./src/scale.js ./src/renderer.js ./src/component.js -b -o dadavis-0.1.0.js
	uglifyjs ./src/core.js ./src/utils.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/interaction.js ./src/scale.js ./src/renderer.js ./src/component.js -o dadavis-0.1.0.min.js -c -m

all:
	uglifyjs ./src/core.js ./src/utils.js ./src/data.js ./src/automatic.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/interaction.js ./src/scale.js ./src/renderer.js ./src/component.js -b -o dadavis-0.1.1.js
	uglifyjs ./src/core.js ./src/utils.js ./src/data.js ./src/automatic.js ./src/template.js ./src/layout.js ./src/attribute.js ./src/interaction.js ./src/scale.js ./src/renderer.js ./src/component.js -o dadavis-0.1.1.min.js -c -m
